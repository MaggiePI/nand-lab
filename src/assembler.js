export const OPS=['NOP','LDI','MOV','LD','ST','ADD','SUB','AND','OR','XOR','CMP','JMP','JZ','JC','SHL','HLT'];
const TWO=new Set(['LDI','MOV','LD','ST','ADD','SUB','AND','OR','XOR','CMP']);
const REG2=new Set(['MOV','ADD','SUB','AND','OR','XOR','CMP']);
function reg(s){if(!/^R[0-3]$/i.test(s||''))throw new Error(`Expected R0–R3, got ${s||'nothing'}`);return +s[1];}
export function assemble(source){
 const labels=new Map(), rows=[];let pc=0;
 const parse=source.split(/\r?\n/).map((raw,i)=>({raw,line:i+1,text:raw.replace(/;.*$/,'').trim()}));
 const fail=(line,msg)=>{throw new Error(`Line ${line}: ${msg}`);};
 for(const row of parse){let s=row.text;if(!s)continue;
  const m=s.match(/^([A-Za-z_]\w*):/);if(m){const key=m[1].toUpperCase();if(labels.has(key))fail(row.line,'Duplicate label');labels.set(key,pc);s=s.slice(m[0].length).trim();}if(!s)continue;
  const [name,...rest]=s.split(/\s+/);const op=name.toUpperCase(), args=rest.join(' ').split(',').map(v=>v.trim()).filter(Boolean);
  if(op!=='.BYTE'&&!OPS.includes(op))fail(row.line,`Unknown instruction ${op}`);
  const size=op==='.BYTE'?args.length:2;if(!size)fail(row.line,'Missing bytes');
  if(pc+size>0xC0)fail(row.line,'Program overlaps framebuffer at 0xC0');
  rows.push({...row,op,args,address:pc,size});pc+=size;
 }
 const number=s=>{if(labels.has((s||'').toUpperCase()))return labels.get(s.toUpperCase());if(!/^(?:0x[\da-f]+|0b[01]+|\d+)$/i.test(s||''))throw new Error(`Invalid value or unknown label: ${s}`);const n=Number(s);if(n<0||n>255)throw new Error('Value must be 0–255');return n;};
 const bytes=new Uint8Array(pc), listing=[];
 for(const row of rows){try{
  const {op,args,address}=row;let data;
  if(op==='.BYTE')data=args.map(number);
  else{const expected=TWO.has(op)?2:['SHL','JMP','JZ','JC'].includes(op)?1:0;if(args.length!==expected)throw new Error(`${op} expects ${expected} operands`);
   let r=0,s=0,operand=0;
   if(TWO.has(op)){r=reg(args[0]);if(REG2.has(op))s=reg(args[1]);else operand=number(args[1]);}
   else if(op==='SHL')r=reg(args[0]);else if(expected)operand=number(args[0]);
   data=[(OPS.indexOf(op)<<4)|(r<<2)|s,operand];
  }
  bytes.set(data,address);listing.push({...row,bytes:data});
 }catch(e){fail(row.line,e.message);}}
 return {bytes,listing,labels:Object.fromEntries(labels)};
}
export function disassemble(code,operand){const op=OPS[code>>>4],r=`R${(code>>>2)&3}`,s=`R${code&3}`,n=`0x${operand.toString(16).padStart(2,'0').toUpperCase()}`;return op+(TWO.has(op)?` ${r}, ${REG2.has(op)?s:n}`:op==='SHL'?` ${r}`:['JMP','JZ','JC'].includes(op)?` ${n}`:'');}
