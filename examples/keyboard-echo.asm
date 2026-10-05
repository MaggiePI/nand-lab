; Queue input below, then Run. Stops when queue is empty.
LDI R1, 0
loop:
LD R0, 0xF1
CMP R0, R1
JZ done
ST R0, 0xF0
JMP loop
done:
HLT
