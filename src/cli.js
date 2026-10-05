#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {assemble} from './assembler.js';
import {CPU} from './cpu.js';
const [command,path,arg]=process.argv.slice(2);
try{
 if(!['assemble','run'].includes(command)||!path)throw new Error('Usage: node src/cli.js assemble program.asm [output.bin]\n       node src/cli.js run program.asm [ASCII input]');
 const p=assemble(readFileSync(path,'utf8'));
 if(command==='assemble'){
  if(arg)writeFileSync(arg,p.bytes);
  else for(const row of p.listing)console.log(`${row.address.toString(16).padStart(2,'0')}  ${row.bytes.map(b=>b.toString(16).padStart(2,'0')).join(' ')}  ${row.text}`);
 }else{
  const c=new CPU();c.reset(p.bytes);c.enqueue(arg??'');const halted=c.run(100000);
  if(c.output)process.stdout.write(c.output);
  console.error(JSON.stringify({halted,clocks:c.cycles,instructions:c.instructions,registers:[...c.registers],flags:{Z:c.z,C:c.c,V:c.v}}));
  if(!halted){console.error('Stopped after 100000 instructions; program did not halt.');process.exitCode=2;}
 }
}catch(e){console.error(e.message);process.exitCode=1;}
