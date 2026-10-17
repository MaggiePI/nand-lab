import {CPU} from './cpu.js';
import {assemble,disassemble} from './assembler.js';
import {examples} from './examples.js';
import * as logic from './logic.js';
const $=id=>document.getElementById(id), hex=n=>n.toString(16).padStart(2,'0').toUpperCase();
const cpu=new CPU();let program=null,timer=null,inspection=null;
for(const name of Object.keys(examples))$('example').add(new Option(name,name));
$('source').value=examples[$('example').value];
function stop(){clearInterval(timer);timer=null;$('run').textContent='Run';}
function compile(){stop();try{const result=assemble($('source').value);program=result;cpu.reset(program.bytes);$('error').textContent='';renderListing();render();}catch(e){$('error').textContent=e.message;$('status').textContent='Assembly error';}}
function renderListing(){const root=$('listing');root.replaceChildren();for(const row of program?.listing??[]){const div=document.createElement('div');div.className='row';div.dataset.address=row.address;div.textContent=`${hex(row.address)}  ${row.bytes.map(hex).join(' ')}  ${row.text}`;root.append(div);}}
function render(){
 $('status').textContent=cpu.halted?'Halted':timer?'Running':'Paused';$('phase').textContent=cpu.halted?'HALT':`Next: ${cpu.phase.toUpperCase()}`;
 $('pcText').textContent=`0x${hex(cpu.pc)}`;$('irText').textContent=`${hex(cpu.ir)} / ${hex(cpu.operand)}`;$('memText').textContent=cpu.bus?`${cpu.bus.kind.toUpperCase()} ${hex(cpu.bus.address)} → ${hex(cpu.bus.value)}`:'256 bytes';
 $('regText').textContent=[...cpu.registers].map(hex).join(' · ');$('aluText').textContent=cpu.lastALU?`${cpu.lastALU.op}: ${cpu.lastALU.a} → ${cpu.lastALU.value}`:'Waiting for ALU operation';
 const active=cpu.phase==='operand'?['pcNode','irNode','memNode']:cpu.phase==='execute'?['irNode','memNode']:cpu.lastALU?['regNode','aluNode']:cpu.bus?['regNode','memNode']:['regNode'];
 for(const id of ['pcNode','irNode','memNode','regNode','aluNode'])$(id).classList.toggle('active',active.includes(id));
 $('activity').textContent=cpu.phase==='operand'?`Fetched instruction ${hex(cpu.ir)} from ${hex(cpu.startPC)}. Next: read operand.`:cpu.phase==='execute'?`Operand ${hex(cpu.operand)} loaded. Next: ${disassemble(cpu.ir,cpu.operand)}.`:cpu.history.length?`Completed ${cpu.history[0].text}${cpu.halted?' — machine halted.':'. Next: fetch.'}`:'Assembled. Advance the clock to fetch the first instruction.';
 $('registers').innerHTML=[...cpu.registers].map((v,i)=>`<div class="register">R${i}<b>${hex(v)}</b><small>${v} · ${v.toString(2).padStart(8,'0')}</small></div>`).join('');
 $('counters').textContent=`Z ${cpu.z}  C ${cpu.c}  V ${cpu.v}  |  ${cpu.cycles} clocks · ${cpu.instructions} instructions`;
 const t=cpu.lastALU;$('aluSummary').textContent=t?`${t.op}: ${t.a} and ${t.b} → ${t.value} · ${t.gates} NAND evaluations · Z=${t.zero} C=${t.carry} V=${t.overflow}`:'Execute ADD, SUB or CMP to see every carry.';
 $('ripple').innerHTML=t?.stages.length?`<table><thead><tr><th>Bit</th><th>A</th><th>B*</th><th>C in</th><th>Sum</th><th>C out</th></tr></thead><tbody>${t.stages.map(s=>`<tr class="${s.carryOut?'highlight':''}"><td>${s.bit}</td><td>${s.a}</td><td>${s.b}</td><td>${s.carryIn}</td><td>${s.sum}</td><td>${s.carryOut}</td></tr>`).join('')}</tbody></table>`:'';
 const ctx=$('screen').getContext('2d');ctx.fillStyle='#101718';ctx.fillRect(0,0,320,160);ctx.fillStyle='#c4f181';for(let y=0;y<8;y++)for(let x=0;x<16;x++)if(cpu.memory[0xC0+y*2+(x>>3)]&(1<<(7-(x%8))))ctx.fillRect(x*20+2,y*20+2,16,16);
 $('terminal').textContent=cpu.output||'Terminal ready.';$('queued').textContent=`${cpu.input.length} input bytes queued`;
 const cells=$('memory').children;for(let i=0;i<256;i++){const el=cells[i];el.textContent=hex(cpu.memory[i]);el.className=(cpu.memory[i]?'nonzero ':'')+(i===cpu.pc?'pc ':'')+(i>=0xC0&&i<=0xCF||i===0xF0||i===0xF1?'io':'');el.title=`0x${hex(i)}: ${cpu.memory[i]}`;}
 if(inspection!==null)$('inspect').textContent=`0x${hex(inspection)} = ${cpu.memory[inspection]} / ${cpu.memory[inspection].toString(2).padStart(8,'0')}${inspection===0xF0?' · write-only terminal port; reads backing RAM':inspection===0xF1?' · read consumes input; grid shows backing RAM':''}`;
 $('trace').replaceChildren();for(const h of cpu.history){const el=document.createElement('div');el.className='row';el.textContent=`${hex(h.pc)}  ${h.text}   [${h.registers.map(hex).join(' ')}]`;$('trace').append(el);}
 for(const el of $('listing').children)el.classList.toggle('active',Number(el.dataset.address)===(cpu.phase==='fetch'?cpu.pc:cpu.startPC));
 $('clock').disabled=cpu.halted;$('step').disabled=cpu.halted;
}
for(let i=0;i<256;i++){const btn=document.createElement('button');btn.setAttribute('aria-label',`Inspect address ${hex(i)}`);btn.onclick=()=>{inspection=i;render();};$('memory').append(btn);}
$('assemble').onclick=compile;$('example').onchange=()=>{$('source').value=examples[$('example').value];compile();};
$('reset').onclick=()=>{stop();if(program)cpu.reset(program.bytes);render();};
$('clock').onclick=()=>{stop();cpu.clock();render();};$('step').onclick=()=>{stop();cpu.step();render();};
function start(){if(cpu.halted)return;timer=setInterval(()=>{cpu.step();if(cpu.halted)stop();render();},1000/Number($('speed').value));$('run').textContent='Pause';render();}
$('run').onclick=()=>{if(timer){stop();render();}else start();};$('speed').oninput=()=>{if(timer){stop();start();}};
$('inputForm').onsubmit=e=>{e.preventDefault();cpu.enqueue($('keyboard').value);$('keyboard').value='';render();};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([$ ('source').value],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='program.asm';a.click();URL.revokeObjectURL(url);};
function gate(){const op=$('gate').value,a=Number($('a').checked),b=Number($('b').checked),s=Number($('sel').checked);const fn=(a,b,t)=>op==='NOT'?logic.not(a,t):op==='MUX'?logic.mux(a,b,s,t):logic[op.toLowerCase()](a,b,t);const t={gates:0};const out=fn(a,b,t);$('gateOutput').textContent=`OUT ${out} · ${t.gates} NANDs`;$('truth').innerHTML=`<table><thead><tr><th>A</th><th>B</th><th>${op==='MUX'?`Select = ${s}`:op}</th></tr></thead><tbody>${[0,1].flatMap(x=>[0,1].map(y=>`<tr class="${x===a&&y===b?'highlight':''}"><td>${x}</td><td>${y}</td><td>${fn(x,y)}</td></tr>`)).join('')}</tbody></table>`;}
for(const id of ['gate','a','b','sel'])$(id).onchange=gate;
compile();gate();
