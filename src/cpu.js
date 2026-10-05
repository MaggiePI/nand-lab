import {alu,mux8} from './logic.js';
import {OPS,disassemble} from './assembler.js';
export class CPU{
 constructor(){this.reset();}
 reset(program=new Uint8Array()){
  this.memory=new Uint8Array(256);this.memory.set(program);this.registers=new Uint8Array(4);
  this.pc=0;this.ir=0;this.operand=0;this.z=0;this.c=0;this.v=0;this.phase='fetch';this.halted=false;this.cycles=0;this.instructions=0;this.output='';this.input=[];this.history=[];this.lastALU=null;this.bus=null;this.startPC=0;this.gates=0;
 }
 enqueue(text){for(const ch of text)this.input.push(ch.charCodeAt(0)&255);}
 read(address){return address===0xF1?(this.input.shift()??0):this.memory[address];}
 write(address,value){if(address===0xF0)this.output=(this.output+String.fromCharCode(value)).slice(-4096);else this.memory[address]=value;}
 clock(){
  if(this.halted)return;this.cycles++;this.bus=null;
  if(this.phase==='fetch'){this.startPC=this.pc;this.ir=this.memory[this.pc];this.bus={kind:'read',address:this.pc,value:this.ir};this.pc=alu('ADD',this.pc,1).value;this.phase='operand';return;}
  if(this.phase==='operand'){this.operand=this.memory[this.pc];this.bus={kind:'read',address:this.pc,value:this.operand};this.pc=alu('ADD',this.pc,1).value;this.phase='execute';return;}
  const op=OPS[this.ir>>>4],r=(this.ir>>>2)&3,s=this.ir&3,a=this.registers[r],b=this.registers[s];this.lastALU=null;
  const set=value=>{const t={gates:0};this.registers[r]=mux8(a,value,1,t);this.gates+=t.gates;};
  if(op==='LDI')set(this.operand);
  else if(op==='MOV')set(b);
  else if(op==='LD'){const v=this.read(this.operand);set(v);this.bus={kind:'read',address:this.operand,value:v};}
  else if(op==='ST'){this.write(this.operand,a);this.bus={kind:'write',address:this.operand,value:a};}
  else if(['ADD','SUB','AND','OR','XOR','CMP','SHL'].includes(op)){
   this.lastALU={op,a,b,...alu(op,a,b)};this.gates+=this.lastALU.gates;this.z=this.lastALU.zero;this.c=this.lastALU.carry;this.v=this.lastALU.overflow;if(op!=='CMP')set(this.lastALU.value);
  }else if(op==='JMP'||(op==='JZ'&&this.z)||(op==='JC'&&this.c))this.pc=this.operand;
  else if(op==='HLT')this.halted=true;
  this.instructions++;this.history.unshift({pc:this.startPC,text:disassemble(this.ir,this.operand),registers:[...this.registers]});this.history=this.history.slice(0,80);this.phase='fetch';
 }
 step(){if(this.halted)return;do{this.clock();}while(!this.halted&&this.phase!=='fetch');}
 run(limit=10000){for(let i=0;i<limit&&!this.halted;i++)this.step();return this.halted;}
}
