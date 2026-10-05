# N8 machine specification

## State and timing

N8 has four unsigned 8-bit registers, 256 bytes of unified memory, an 8-bit PC, instruction register (IR), operand latch, Z/C/V flags, and a halt bit. All initial state is zero. Loading a program resets all state, memory, output and input.

Every instruction takes three phase clocks:

1. **Fetch:** latch `memory[PC]` into IR; increment PC modulo 256.
2. **Operand:** latch `memory[PC]`; increment PC modulo 256.
3. **Execute:** decode and commit the operation, then return to fetch.

The UI shows the **next** phase and highlights the most recently active components. Instruction stepping completes the current instruction if stopped midway. HLT consumes all three phases and subsequently ignores clocks. Fetch and operand read backing RAM directly, without triggering device reads. There is no invalid-opcode trap because all 16 opcode values are assigned. Arbitrary machine bytes are accepted, including unaligned jumps; the assembler emits canonical encodings but does not enforce instruction alignment on branch targets.

## Instruction encoding

Two bytes per instruction:

| Byte | Bits | Meaning |
|---|---|---|
| 0 | 7–4 | Opcode |
| 0 | 3–2 | Destination register r |
| 0 | 1–0 | Source register s |
| 1 | 7–0 | Immediate value or absolute address |

Unused fields are emitted as zero and ignored by the CPU. Byte 1 is fetched even for instructions without an operand.

| Hex opcode | Assembly | Operation | Flags |
|---|---|---|---|
| 0 | NOP | No operation | Preserve |
| 1 | LDI r, n | r ← n | Preserve |
| 2 | MOV r, s | r ← s | Preserve |
| 3 | LD r, addr | r ← read(addr) | Preserve |
| 4 | ST r, addr | write(addr, r) | Preserve |
| 5 | ADD r, s | r ← r + s, modulo 256 | Z C V |
| 6 | SUB r, s | r ← r − s, modulo 256 | Z C V |
| 7 | AND r, s | r ← r AND s | Z; clear C V |
| 8 | OR r, s | r ← r OR s | Z; clear C V |
| 9 | XOR r, s | r ← r XOR s | Z; clear C V |
| A | CMP r, s | Evaluate r − s, discard result | Z C V |
| B | JMP addr | PC ← addr | Preserve |
| C | JZ addr | Branch if Z = 1 | Preserve |
| D | JC addr | Branch if C = 1 | Preserve |
| E | SHL r | r ← r << 1, modulo 256 | Z, C = old bit 7; clear V |
| F | HLT | Halt | Preserve |

Z indicates the ALU result is zero. Addition C indicates unsigned overflow. Subtraction/CMP C means **no borrow**, so JC after CMP branches when the first unsigned operand is greater than or equal to the second. V indicates two's-complement signed overflow; it is carry into the sign bit XOR carry out. No branch tests V directly. Loads do not update Z, so use CMP before JZ.

## Memory and devices

| Address | Purpose |
|---|---|
| 00–BF | Program and general RAM. Assembler output is limited to these 192 bytes. |
| C0–CF | 16 bytes of framebuffer: 2 bytes per row, 8 rows, MSB is leftmost pixel. |
| D0–EF | Additional general RAM |
| F0 | ST appends one byte to text output; LD reads backing RAM. ST does not change backing RAM. |
| F1 | LD consumes one queued byte, or returns zero when empty; ST writes backing RAM. |
| F2–FF | General RAM |

The memory inspector displays backing RAM, including F0/F1, not device buffers. Text output is bounded to the most recent 4,096 characters. Browser keyboard input is intended for ASCII; other UTF-16 character codes are truncated to 8 bits, not UTF-8 encoded.

There is no hardware code protection. ST can modify instructions, and execution can enter device regions. The assembler reserves C0 onward to avoid accidental display/device overlap. Data included with .BYTE counts toward program size.

## Assembly language

Case-insensitive mnemonics, registers and labels. Labels match `[A-Za-z_]\w*`; a label may stand alone or precede an instruction. Comments begin with `;`. Operands are comma-separated. Values accept decimal, hexadecimal (`0xFF`), binary (`0b1010`) or labels, in 0–255. No negative literals, expressions, strings or macros. `.BYTE` emits one or more raw values.

```asm
LDI R0, 255
LDI R1, 1
ADD R0, R1
JC wrapped
HLT
wrapped:
LDI R2, 87  ; ASCII W
ST R2, 0xF0
HLT
```

## Logic boundary

The single Boolean primitive is NAND. Composite gate functions derive from it. The 8-bit arithmetic path chains eight full adders. Subtraction feeds inverted B and an initial carry of one. The microscope displays this transformed B (marked B*) and each carry. Logical operations clear carry and overflow. SHL rewires bit positions rather than using adder logic.

The NAND counter is a count of function evaluations for the selected combinational ALU operation. It is not a netlist area, transistor count, power estimate or clock-cost estimate. Host state mutation supplies sequential storage; host decoding/control and arrays supply the rest of the functional machine.
