; 255 + 1 wraps to 0. Carry and zero become 1.
LDI R0, 255
LDI R1, 1
ADD R0, R1
JC wrapped
HLT
wrapped:
LDI R2, 87
ST R2, 0xF0
HLT
