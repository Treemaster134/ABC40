/*
0 paused
1 stopped
2 1=char 0=decimal
*/

let Registers = {
    "00": "00000000", //Status (Display mode, running or not, etc..) 
    "01": "00000000", //Accumulator
    "02": "00000000", //Input
    "03": "00000000", //Output
    "04": "00000000", //Display row 1
    "05": "00000000", //Display row 2
    "06": "00000000", //Display row 3
    "07": "00000000", //Display row 4
    "08": "01000000", // 08 - 1F general purpose memory
    "09": "00000000", 
    "0A": "00000000",
    "0B": "00000000",
    "0C": "00000000",
    "0D": "00000000",
    "0E": "00000000",
    "0F": "00000000",
    "10": "00000000",
    "11": "00000000",
    "12": "00000000",
    "13": "00000000",
    "14": "00000000",
    "15": "00000000",
    "16": "00000000",
    "17": "00000000",
    "18": "00000000",
    "19": "00000000",
    "1A": "00000000",
    "1B": "00000000",
    "1C": "00000000",
    "1D": "00000000",
    "1E": "00000000",
    "1F": "00000000"
};

let programCounter = 0;
let stackPointer = 0;
let stack = [];

let registerDisplays = [];
let inputButtons = [];
let counterDisplay;
let spDisplay;
let statusLights = [];
let instructions = [];
let outputConsole;
let pixelOutput;

let numberOutput = 0;

let consoleOutput = [
    [],
    [],
    [],
    [],
    [],
    [],
    []
];


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function init()
{
    registerDisplays = [];
    statusLights = [];
    inputButtons = [];
    counterDisplay = document.getElementById("counterDisplay");
    spDisplay = document.getElementById("spDisplay");

    for(let i = 0; i < 32; i++)
    {
        registerDisplays.push(document.getElementById("mem" + i));
    }

    for(let i = 0; i < 8; i++)
    {
        inputButtons.push(document.getElementById("inputbutton" + i))
    }

    statusLights.push(document.getElementById("pausedLight"));
    statusLights.push(document.getElementById("stoppedLight"));

    outputConsole = document.getElementById("consoleOutput").getContext("2d");
    pixelOutput = document.getElementById("pixelOutput").getContext("2d");
    outputConsole.fillStyle = "#ffbf00";
    outputConsole.font = "32px ModernDOS";

    tempReg = Registers["00"].split("");
    tempReg[0] = "0";
    tempReg[1] = "1";
    Registers["00"] = tempReg.join("");

    consoleOutput = [[],[],[],[],[],[],[]];
    stackPointer = 0;
    stack = [];

}


function startRunning()
{
    programCounter = 0;
    instructions = [];
    stackPointer = 0;
    stack = [];

    instructions = document.getElementById("instructions").value.split("\n");
    
    tempReg = Registers["00"].split("");
    tempReg[0] = "0";
    tempReg[1] = "0";
    Registers["00"] = tempReg.join("");

    consoleOutput = [[],[],[],[],[],[],[]];
    outputConsole.clearRect(0,0,420,240);
    pixelOutput.clearRect(0,0,320,160);
    
    let registerIndex = "0";
    for(let i = 0; i < registerDisplays.length; i++)
    {
        registerIndex = i.toString(16);
        if(registerIndex.length < 2){registerIndex = "0" + registerIndex;}
        Registers[registerIndex.toUpperCase()] = "00000000";
    }
    setDisplays();

}



function correctBinary(data, mode)
{
    if(mode == 8)
    {

        let tempdata = Math.abs(data).toString(2).padStart(8, '0').split("");
        
        if(data < 0)
        {
            
            tempdata = Math.abs(data + 1).toString(2).padStart(8, '0').split("");
            for(let i = 0; i < tempdata.length; i++)
            {
                tempdata[i] = Number(tempdata[i] != "1"); 
            }
        }
    
    
        return tempdata;
    }
    if(mode == 16)
    {
        let tempdata = Math.abs(data).toString(2).padStart(16, '0').split("");
        
        if(data < 0)
        {
            
            tempdata = Math.abs(data + 1).toString(2).padStart(16, '0').split("");
            for(let i = 0; i < tempdata.length; i++)
            {
                tempdata[i] = Number(tempdata[i] != "1"); 
            }
        }
    
    
        return tempdata;
    }
}



function clampDecimal(decimal)
{
    if(decimal > 127)
    {
        decimal = -128 + ((decimal-1) - 127);
        console.log(decimal);
        return;
    }
    if(decimal < -128)
    {
        decimal = 127 + ((decimal+1) + 128);
        console.log(decimal);
        return;
    }
}

function setDisplays()
{
    let registerIndex = "0";
    for(let i = 0; i < registerDisplays.length; i++)
    {
        registerIndex = i.toString(16);
        if(registerIndex.length < 2){registerIndex = "0" + registerIndex;}
        registerDisplays[i].value = Registers[registerIndex.toUpperCase()];
    }

    counterDisplay.value = programCounter.toString(2).padStart(16, "0");
    spDisplay.value = stackPointer.toString(2).padStart(16, "0");

    if(Registers["00"][0] == 1){statusLights[0].src = "assets/on.png";}else{statusLights[0].src = "assets/off.png";}
    if(Registers["00"][1] == 1){statusLights[1].src = "assets/on.png";}else{statusLights[1].src = "assets/off.png";}
}

function switchButton(ogVal, element)
{
    if(ogVal == 1)
    {
        element.value = 0;
    }
    else if(ogVal == 0)
    {
        element.value = 1;
    }
}

/* Loading to accumulator */ 
function loadRegister(address) //LDA
{
    Registers["01"] = Registers[address].substring(0, 8);
}

function loadImmediate(data) //LDI
{
    Registers["01"] = data;
}


/* Store */
function store(address) //STO
{
    Registers[address] = Registers["01"].substring(0, 8);
}


/* Move */
function move(src, dest) //MOV
{
    Registers[dest] = Registers[src].substring(0, 8);
}


/* Swap */
function swap(reg1, reg2) //SWA
{
    let temp = Registers[reg1].substring(0, 8);
    Registers[reg1] = Registers[reg2].substring(0, 8);
    Registers[reg2] = temp;
}


/* Shifting */
function leftShift()// divide by 2  LSH
{
    Registers["01"] = Registers["01"].substring(1, 8).padEnd(8, "0");
}

function rightShift()// divide by 2 RSH
{
    Registers["01"] = Registers["01"].substring(0, 7).padStart(8, "0");
}


/* Increment and decrement */
function increment()  //INC
{
    addImmediate("00000001");
}

function decrement() //DEC
{
    subImmediate("00000001");
}

/* Adding */
function addRegister(address) //ADR  .substring(0, 8);
{
    let decimal = Number(new Int8Array(["0b" + Registers["01"]])) + Number(new Int8Array(["0b" + Registers[address]]));
    clampDecimal(decimal);
    Registers["01"] = correctBinary(decimal, 8).join("");
}

function addImmediate(data) //ADI
{
    let decimal = Number(new Int8Array(["0b" + Registers["01"]])) + Number(new Int8Array(["0b" + data]));
    clampDecimal(decimal);
    Registers["01"] = correctBinary(decimal, 8).join("");
}


/* Subtracting */
function subRegister(address) //SBR
{
    let decimal = Number(new Int8Array(["0b" + Registers["01"]])) - Number(new Int8Array(["0b" + Registers[address]]));
    clampDecimal(decimal);
    Registers["01"] = correctBinary(decimal, 8).join("");
}

function subImmediate(data) //SBI
{
    let decimal = Number(new Int8Array(["0b" + Registers["01"]])) - Number(new Int8Array(["0b" + data]));
    clampDecimal(decimal);
    Registers["01"] = correctBinary(decimal, 8).join("");
}


/* Stack */
function stackPush()
{
    stack.push(Registers["01"].substring(0, 8));
    stackPointer = stack.length;
}

function stackPop()
{
    Registers["01"] = stack.pop();
    stackPointer = stack.length;
}


/* Output and input */ 
function output() //OUT
{
    if(Registers["00"][2] == "1")
    {  
        if(Registers["03"] == "00001010")
        {
            consoleOutput.shift();
            consoleOutput.push([]);
        }
        else
        {
            consoleOutput[consoleOutput.length - 1].push(String.fromCharCode("0b" + Registers["03"]));
        }
    }
    else
    {
        consoleOutput[consoleOutput.length - 1].push(Number(new Int8Array(["0b" + Registers["03"]])));
    }

    outputConsole.clearRect(0,0,420,240);
    outputConsole.font = "32px ModernDOS";
    for(let i = 0; i < consoleOutput.length; i++)
    {
        outputConsole.fillText(consoleOutput[i].join(""), 10, 30 + i * 32);
    }

    pixelOutput.clearRect(0,0,320,160);
    pixelOutput.fillStyle = "white";
    for(let i = 0; i < 8; i++)
    {
        if(Registers["04"][i] == "1")
        {
            pixelOutput.fillRect(i * 40, 0, 40, 40);
        }
        if(Registers["05"][i] == "1")
        {
            pixelOutput.fillRect(i * 40, 40, 40, 40);
        }
        if(Registers["06"][i] == "1")
        {
            pixelOutput.fillRect(i * 40, 80, 40, 40);
        }
        if(Registers["07"][i] == "1")
        {
            pixelOutput.fillRect(i * 40, 120, 40, 40);
        }
    }
}

function input() //INP
{
    let tempReg = Registers["02"].split("");

    for(let i = 0; i < 8; i++)
    {
        tempReg[i] = inputButtons[i].value;
    }

    Registers["02"] = tempReg.join("");
}


/* Jumps */
function jumpIfZero(instruction) //JMZ
{
    if(Registers["01"] == "00000000")
    {
        jumpUnconditional(instruction);
    }
}

function jumpIfPositive(instruction) //JMP
{
    if(Registers["01"][0] == "0" && Registers["01"] != "00000000")
    {
        jumpUnconditional(instruction);
    }
}

function jumpIfNegative(instruction) //JMN
{
    if(Registers["01"][0] == "1")
    {
        jumpUnconditional(instruction);
    }
}

function jumpUnconditional(instruction) //JMU
{
    let convertedInstruction = Number(new Int16Array(["0b" + instruction]));
    programCounter = convertedInstruction;
    ignoreIncrement = true;
}

/* Random */
function randomNumber(min, max) //RND
{   
    Registers["01"] = correctBinary(getRandomInt(new Int8Array([min]), new Int8Array([max])), 8).join("");
}   

/* Halt and wait*/
function halt() //HLT
{
    let tempReg = Registers["00"].split("");
    tempReg[1] = "1";
    Registers["00"] = tempReg.join("");
    ignoreIncrement = true;
}

function wait()
{
    let tempReg = Registers["00"].split("");
    tempReg[0] = "1";
    Registers["00"] = tempReg.join("");
    ignoreIncrement = true;
}

function resume()
{
    if(Registers["00"][0] == 1)
    {
        let tempReg = Registers["00"].split("");
        tempReg[0] = "0";
        Registers["00"] = tempReg.join("");
        programCounter += 1;
    }
}




/* Bitwise */
function orImmediate(data)
{
    let tempdata = [0,0,0,0,0,0,0,0];
    for(let i = 0; i < 8; i++)
    {
        if(data[i] == 1 || Registers["01"][i] == 1)
        {
            tempdata[i] = 1;
        }
    }
    Registers["01"] = tempdata.join("");
}

function orRegister(address)
{
    let tempdata = [0,0,0,0,0,0,0,0];
    for(let i = 0; i < 8; i++)
    {
        if(Registers[address][i] == 1 || Registers["01"][i] == 1)
        {
            tempdata[i] = 1;
        }
    }
    Registers["01"] = tempdata.join("");
}

function xorImmediate(data)
{
    let tempdata = [0,0,0,0,0,0,0,0];
    for(let i = 0; i < 8; i++)
    {
        if(data[i] != Registers["01"][i])
        {
            tempdata[i] = 1;
        }
    }
    Registers["01"] = tempdata.join("");
}

function xorRegister(address)
{
    let tempdata = [0,0,0,0,0,0,0,0];
    for(let i = 0; i < 8; i++)
    {
        if(Registers[address][i] != Registers["01"][i])
        {
            tempdata[i] = 1;
        }
    }
    Registers["01"] = tempdata.join("");
}

function andImmediate(data)
{
    let tempdata = [0,0,0,0,0,0,0,0];
    for(let i = 0; i < 8; i++)
    {
        if(data[i] == 1 && Registers["01"][i] == 1)
        {
            tempdata[i] = 1;
        }
    }
    Registers["01"] = tempdata.join("");
}

function andRegister(address)
{
    let tempdata = [0,0,0,0,0,0,0,0];
    for(let i = 0; i < 8; i++)
    {
        if(Registers[address][i] == 1 && Registers["01"][i] == 1)
        {
            tempdata[i] = 1;
        }
    }
    Registers["01"] = tempdata.join("");
}
