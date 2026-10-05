# Decisions worth examining

## Why these constraints?

Four registers leave enough room for loops while keeping every register visible. A 4-bit opcode makes the complete instruction set small enough to learn. Fixed two-byte instructions simplify decoding and source mapping at the cost of density: even HLT consumes an operand byte. Direct addressing keeps the machine small but makes generic string loops awkward. The hello sample consequently uses repeated literal loads.

Unified memory makes self-modifying code possible. Device addresses provide a simple contract between code and browser output, without pretending to be an operating system. Three visible phases allow fetching to be inspected separately from state changes.

The assembler is intentionally strict about operands and byte ranges. The machine is intentionally permissive about raw bytes. These are different contracts: errors that the assembler prevents can still occur when RAM changes during execution.

## Read the implementation from the bottom

1. Start with `nand` and verify the four-row truth table.
2. Derive NOT, AND, OR, XOR, and MUX. Compare NAND evaluation counts.
3. Trace one full-adder row in the ALU. Try 255 + 1, 127 + 1, and 0 − 1.
4. Follow mux8 when a register changes. Observe that flag updates are separate from writes.
5. Read the CPU's three phases and test a branch taken versus not taken.
6. Decode a machine instruction by hand, then compare the assembler output.
7. Send a value to F0 and to C0. Same ST instruction, different device behavior.

## Useful next projects

- Replace the opcode decode with a 4-to-16 NAND netlist; expose the control signals.
- Model D flip-flops and edge-triggered registers, then drive control with a gate-level state machine.
- Add indirect memory addressing. Decide which existing opcode to replace or how to extend encoding.
- Add a call stack, then functions. Define overflow and return-address semantics before writing code.
- Write a tiny expression compiler targeting N8; keep generated assembly visible.
- Add a larger display only after defining the address space tradeoff.
- Implement deterministic replay and breakpoint handling around the existing clock method.

A physical build would additionally need electrical timing, fan-out, debouncing and real clock behavior. This simulator makes no claims about those constraints. Mr Jones can keep the soldering iron for that milestone.
