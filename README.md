# NAND Lab

An original tiny computer you can inspect in your browser: NAND-derived gates → ripple-carry ALU → N8 CPU → custom ISA → assembler → programs.

The workbench includes an editable assembly pane, machine-code listing, three-phase clock controls, live datapath, registers and flags, all 256 memory bytes, carry-chain microscope, Boolean gate playground, terminal, keyboard queue, pixel screen and instruction trace. Everything runs locally. No build pipeline or npm dependencies.

## Run

Requires Python 3. Node 20+ is only needed for tests.

```sh
cd nand-lab
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://localhost:8000**. ES modules need an HTTP server; opening `index.html` directly will not work in typical browsers.

Alternatively, `npm start` launches the same server. No `npm install` is needed.

Choose a sample and press **Assemble & reset**, then **Clock** for a single phase, **Instruction** to complete the current instruction, or **Run** for continuous execution. Run becomes Pause. Example selection assembles and resets immediately; edits require Assemble & reset. Reset reloads the last successfully assembled program. Input is queued after reset. An empty input queue returns zero immediately; echo halts when it sees zero.

## A deliberate boundary

This is a working educational computer with an original architecture, not a completed nand2tetris implementation. AND, OR, XOR, muxes, full-adder arithmetic, zero detection and register input selection derive from NAND. PC increments use the same ripple adder. Sequential registers, RAM, instruction decoding and phase control are explicit JavaScript state and control flow. There is no transistor simulation, electrical propagation, HDL elaboration, compiler or operating system. The datapath illustrates functional flow; one clock is a simulator phase rather than an electrical waveform. NAND evaluation counts describe the ALU operation, not physical gate counts or total CPU cost.

The architectural choices are yours to extend. A useful next milestone is replacing instruction decoding and control with a gate netlist, then replacing host state with simulated flip-flops. That would support the stronger claim of a fully gate-level CPU.

## N8 in brief

- Four 8-bit registers: R0–R3; 8-bit PC, instruction and operand latches.
- Unified 256-byte memory; no stack, interrupts or indirect addressing.
- 16 opcodes, fixed two-byte instructions, three clock phases per instruction.
- Z, C and V flags; wrapping 8-bit arithmetic.
- 16 × 8 monochrome framebuffer at C0–CF.
- Byte terminal at F0 and consumable input queue at F1.

See [architecture](docs/architecture.md) for the full encoding and behavior, and [build notes](docs/build-notes.md) for design tradeoffs and exercises.

## Command-line tools

```sh
node src/cli.js assemble examples/hello-world.asm
node src/cli.js assemble examples/pixel-smile.asm screen.bin
node src/cli.js run examples/keyboard-echo.asm "Hello"
```

The runner prints terminal output to stdout and final machine state to stderr. It stops at HLT or 100,000 instructions, with exit code 2 if the budget is exhausted. Assembler errors return exit code 1.

## Verification

```sh
npm test
npm run check
```

The suite exhaustively checks all 65,536 operand pairs for addition, subtraction, AND, OR and XOR against independent arithmetic, including carry and signed overflow. Integration cases cover assembly errors, instruction encoding, clock phases, branches, memory, I/O, samples, wraparound and self-modifying code. GitHub Actions runs the checks on push and pull request.

## Layout

```text
src/logic.js       NAND gates, byte mux, ripple-carry ALU
src/assembler.js   two-pass assembler and disassembler
src/cpu.js         deterministic three-phase CPU and memory-mapped I/O
src/app.js         browser workbench
src/examples.js    bundled sample source
examples/          same programs as editable .asm files
index.html         static entry point
src/style.css      responsive layout
tests/            independent logic and integration verification
docs/             specification and build notes
```

Upload these files to a repository to create your own GitHub project. The archive includes source and CI configuration; no remote repository has been created. You can host the static files on any ordinary static host, without a backend.

Inspired by bottom-up computer-building projects, including nand2tetris. The N8 ISA and implementation here are original; there are no course solution files.

MIT licensed. See [LICENSE](LICENSE).
