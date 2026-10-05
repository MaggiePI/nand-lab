export const examples={
 'Hello, world':`; Send ASCII bytes to the terminal at 0xF0.\nLDI R0, 72\nST R0, 0xF0\nLDI R0, 69\nST R0, 0xF0\nLDI R0, 76\nST R0, 0xF0\nST R0, 0xF0\nLDI R0, 79\nST R0, 0xF0\nLDI R0, 10\nST R0, 0xF0\nHLT`,
 'Fibonacci':`; Twelve Fibonacci updates. R0 ends at 144.\n; Watch 8-bit overflow after 233.\nLDI R0, 0\nLDI R1, 1\nLDI R2, 12\nLDI R3, 1\nloop:\nMOV R3, R0\nADD R0, R1\nMOV R1, R3\nLDI R3, 1\nSUB R2, R3\nJZ done\nJMP loop\ndone:\nST R0, 0xB0\nHLT`,
 'Pixel smile':`; 16 × 8 monochrome screen: two bytes per row, MSB first.\nLDI R0, 0x3C\nST R0, 0xC0\nST R0, 0xC1\nLDI R0, 0x42\nST R0, 0xC2\nST R0, 0xC3\nLDI R0, 0xA5\nST R0, 0xC4\nST R0, 0xC5\nLDI R0, 0x81\nST R0, 0xC6\nST R0, 0xC7\nLDI R0, 0xA5\nST R0, 0xC8\nST R0, 0xC9\nLDI R0, 0x99\nST R0, 0xCA\nST R0, 0xCB\nLDI R0, 0x42\nST R0, 0xCC\nST R0, 0xCD\nLDI R0, 0x3C\nST R0, 0xCE\nST R0, 0xCF\nHLT`,
 'Keyboard echo':`; Queue input below, then Run. Stops when queue is empty.\nLDI R1, 0\nloop:\nLD R0, 0xF1\nCMP R0, R1\nJZ done\nST R0, 0xF0\nJMP loop\ndone:\nHLT`,
 'Carry and wrap':`; 255 + 1 wraps to 0. Carry and zero become 1.\nLDI R0, 255\nLDI R1, 1\nADD R0, R1\nJC wrapped\nHLT\nwrapped:\nLDI R2, 87\nST R2, 0xF0\nHLT`
};
