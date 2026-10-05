// Combinational logic: all Boolean operations ultimately call NAND.
export function nand(a,b, trace) { if(trace) trace.gates++; return a && b ? 0 : 1; }
export const not=(a,t)=>nand(a,a,t);
export const and=(a,b,t)=>not(nand(a,b,t),t);
export const or=(a,b,t)=>nand(not(a,t),not(b,t),t);
export function xor(a,b,t){const n=nand(a,b,t);return nand(nand(a,n,t),nand(b,n,t),t);}
export const mux=(a,b,s,t)=>or(and(a,not(s,t),t),and(b,s,t),t);
export const bits=n=>Array.from({length:8},(_,i)=>(n>>>i)&1);
export const byte=a=>a.reduce((n,b,i)=>n|(b<<i),0);
export const mux8=(a,b,s,t)=>byte(bits(a).map((v,i)=>mux(v,bits(b)[i],s,t)));
export function alu(op,a,b=0){
 const t={gates:0}, aa=bits(a), bb=bits(b), stages=[];let carry=op==='SUB'||op==='CMP'?1:0;
 const result=aa.map((v,i)=>{
  let out;
  if(['ADD','SUB','CMP'].includes(op)){
   const w=op==='ADD'?bb[i]:not(bb[i],t), x=xor(v,w,t), cin=carry;
   out=xor(x,cin,t);carry=or(and(v,w,t),and(x,cin,t),t);
   stages.push({bit:i,a:v,b:w,carryIn:cin,sum:out,carryOut:carry});
  }else if(op==='AND')out=and(v,bb[i],t);
  else if(op==='OR')out=or(v,bb[i],t);
  else if(op==='XOR')out=xor(v,bb[i],t);
  else if(op==='SHL')out=i?aa[i-1]:0;
  else throw new Error(`Unknown ALU operation ${op}`);
  return out;
 });
 if(op==='SHL')carry=aa[7];
 const value=byte(result), zero=not(result.reduce((v,b)=>or(v,b,t),0),t);
 return {value,zero,carry,overflow:['ADD','SUB','CMP'].includes(op)?xor(stages[6].carryOut,stages[7].carryOut,t):0,stages,gates:t.gates};
}
