
Notes

    Values are signed 8 bit binary values
    Negative values use two's complement
    Register addresses are 2 byte Hex values
    Jump addresses are 16 bit unsigned values
    PC starts at 0


Registers

    00 - Status

    0 - paused
    1 - stopped
    2 - 1=char, 0 = decimal

    01 - Accumulator
    02 - Input
    03 - Output
    04-07 - Pixel display row 1-4
    08-1F - General purpose memory