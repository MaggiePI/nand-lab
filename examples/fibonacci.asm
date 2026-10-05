; Twelve Fibonacci updates. R0 ends at 144.
; Watch 8-bit overflow after 233.
LDI R0, 0
LDI R1, 1
LDI R2, 12
LDI R3, 1
loop:
MOV R3, R0
ADD R0, R1
MOV R1, R3
LDI R3, 1
SUB R2, R3
JZ done
JMP loop
done:
ST R0, 0xB0
HLT
