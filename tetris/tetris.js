let tetrisBoardHtml = "";
let tetrisNextHtml = "";
let tetrisSwitchHtml = "";
let initialInterval = 1000;
let levelInit = 1;
let initialReq = 10;
let boardWidth = 10;
let boardHeight = 24;
let amountForbidden = 4;
let tetrisArray = new Array(boardHeight);
let bqLength = 3;
let listBlockTypes = [["t", 4], ["o", 1], ["i", 2], ["l", 4], ["j", 4], ["s", 2], ["z", 2]];
let panicTime = 250;
let gRatio = 1.618;
let nRatio = 1.1;

let numLinesCleared = 0;
let intervalRate = initialInterval;
let currentReq = initialReq;
let levelNumber = levelInit;
let currentBlock;
let blockSwitch;
let blockQueue = [];
let isGamePlaying = false;
let isGamePaused = false;
let gameInterval;
let hadtomove;
let sbHolder;
let hasSwitched = false;
let doPanic;
let isSoundEnabled = true;

let keyL = "ArrowLeft";
let keyR = "ArrowRight";
let keyD = "ArrowDown";
let keyCW = "x";
let keyWS = "z";
let keyS = "s";

let soundRotate = new p5.SoundFile("blockrotate.wav");
let soundSettle = new p5.SoundFile("blocksettle.wav");
let soundSideMove = new p5.SoundFile("blocksidemove.wav");
let soundSwitch = new p5.SoundFile("blockswitch.wav");
let soundLevelUp = new p5.SoundFile("levelup.wav");

function getRandInteger(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}

// function isEven(value) {
// 	return Math.abs(value) % 2 == 0;
// }

function checkForTrue(filled) {
	return filled == true;
}

function initializeBoards() {
	buildBoardHtml();
	buildNextHtml();
}

class Block {
	constructor(btype,x,y,o) {
		this.shapey = btype;
		this.orientation = o;
		this.center = [x,y];
		if (btype == "t") {
			this.listofo = [
				[[-2,0], [0,0], [2,0], [0,2]], // T
				[[0,-2], [-2,0], [0,0], [0,2]], // + missing right arm
				[[0,-2], [-2,0], [0,0], [2,0]], // upside down T
				[[0,-2], [0,0], [2,0], [0,2]], // + missing left arm
			];
		} else if (btype == "o") {
			this.listofo = [
				[[-1,-1], [-1,1], [1,-1], [1,1]]
			];
		} else if (btype == "i") {
			this.listofo = [
				[[0,-3], [0,-1], [0,1], [0,3]], // vertical
				[[-3,0], [-1,0], [1,0], [3,0]] // horizontal
			];
		} else if (btype == "l") {
			this.listofo = [
				[[-1,-2], [-1,0], [-1,2], [1,2]], // bottom left L
				[[-2,-1], [0,-1], [2,-1], [-2,1]], // top left L
				[[-1,-2], [1,-2], [1,0], [1,2]], // top right L
				[[2,-1], [-2,1], [0,1], [2,1]] // bottom right L
			];
		} else if (btype == "j") {
			this.listofo = [
				[[1,-2], [1,0], [1,2], [-1,2]], // bottom right J
				[[2,-1], [-0,-1], [-2,-1], [2,1]], // top right J
				[[1,-2], [-1,-2], [-1,0], [-1,2]], // top left J
				[[-2,-1], [2,1], [-0,1], [-2,1]] // bottom left J
			];
		} else if (btype == "s") {
			this.listofo = [
				[[0,-1], [2,-1], [-2,1], [0,1]], // S r-l
				[[-1,-2], [-1,0], [1,0], [1,2]] // S u-d
			];
		} else if (btype == "z") {
			this.listofo = [
				[[0,-1], [-2,-1], [2,1], [0,1]], // S r-l
				[[1,-2], [1,0], [-1,0], [-1,2]] // S u-d
			];
		}
		this.innerblocks = [];
		this.ibcurrent = [];
		// this.ibsbycoord = [[], []];
		for (var i = 0; i < this.listofo[o].length; i++) {
			this.innerblocks.push([this.listofo[o][i][0], this.listofo[o][i][1]]);
			this.ibcurrent.push([(this.innerblocks[i][0] + this.center[0]), (this.innerblocks[i][1] + this.center[1])]);
			// this.ibsbycoord[0].push(this.ibcurrent[i][0]);
			// this.ibsbycoord[1].push(this.ibcurrent[i][1]);
		}
	}

	newPosition = () => {
		this.innerblocks.length = 0;
		this.ibcurrent.length = 0;
		// this.ibsbycoord[0].length = 0;
		// this.ibsbycoord[1].length = 0;
		for (var i = 0; i < this.listofo[this.orientation].length; i++) {
			this.innerblocks.push([this.listofo[this.orientation][i][0], this.listofo[this.orientation][i][1]]);
			this.ibcurrent.push([(this.innerblocks[i][0] + this.center[0]), (this.innerblocks[i][1] + this.center[1])]);
			// this.ibsbycoord[0].push(this.ibcurrent[i][0]);
			// this.ibsbycoord[1].push(this.ibcurrent[i][1]);
		}
	}

	removeOffset = () => {
		// if ((this.ibsbycoord[0].find(isEven) == undefined) && (Math.abs(this.center[0]) % 2 == 0)) {
		// 	this.center[0]--;
		// 	hadtomove = true;
		// } else if ((this.ibsbycoord[0].find(isEven) != undefined) && (Math.abs(this.center[0]) % 2 == 1)) {
		// 	this.center[0]++;
		// 	hadtomove = true;
		// }
		// if ((this.ibsbycoord[1].find(isEven) == undefined) && (Math.abs(this.center[1]) % 2 == 0)) {
		// 	this.center[1]--;
		// 	hadtomove = true;
		// } else if ((this.ibsbycoord[1].find(isEven) != undefined) && (Math.abs(this.center[1]) % 2 == 1)) {
		// 	this.center[1]++;
		// 	hadtomove = true;
		// }
		if ((this.innerblocks[0][0] + Math.abs(this.center[0])) % 2 != 0) {
			if (this.innerblocks[0][0] % 2 != 0) {
				this.center[0]--;
			} else if (Math.abs(this.center[0]) % 2 != 0) {
				this.center[0]++;
			}
			hadtomove = true;
		}
		if ((this.innerblocks[0][1] + Math.abs(this.center[1])) % 2 != 0) {
			if (this.innerblocks[0][1] % 2 != 0) {
				this.center[1]--;
			} else if (Math.abs(this.center[1]) % 2 != 0) {
				this.center[1]++;
			}
			hadtomove = true;
		}
		if (hadtomove == true) {
			this.newPosition();
			hadtomove = undefined;
		} else {
			hadtomove = undefined;
		}
	}

	rotate = (d) => {
		// console.log(this);
		if (d == "clockwise") {
			this.innerblocks.length = 0;
			this.ibcurrent.length = 0;
			this.orientation++;
			this.orientation = this.orientation % (this.listofo.length);
			this.newPosition();
		} else if (d == "counterclockwise") {
			this.innerblocks.length = 0;
			this.ibcurrent.length = 0;
			this.orientation += (this.listofo.length - 1);
			this.orientation = this.orientation % (this.listofo.length);
			this.newPosition();
		}
		if (isSoundEnabled) {
			soundRotate.play();
		}
		this.removeOffset();
	}

	moveDown = () => {
		this.center[1] += 2;
		this.newPosition();
	}

	moveSide = (dist) => {
		this.center[0] += dist;
		this.newPosition();
		if (isSoundEnabled) {
			soundSideMove.play();
		}
	}

	settle = () => {
		for (var i = 0; i < this.ibcurrent.length; i++) {
			tetrisArray[this.ibcurrent[i][1]][this.ibcurrent[i][0]] = true;
		}
		if (isSoundEnabled) {
			soundSettle.play();
		}
	}
}

function startGame() {
	if (isGamePlaying == false) {
		isGamePlaying = true;
		fillBlockQueue(bqLength);
		summonBlock();
		gameInterval = new RecurringTimer(() => {moveDownTest(currentBlock)},initialInterval);
	}
}

function pauseGame() {
	if (isGamePlaying && !isGamePaused) {
		gameInterval.pause();
		isGamePaused = true;
	} else if (isGamePlaying && isGamePaused) {
		gameInterval.resume();
		isGamePaused = false;
	}
}

function fillBlockQueue(num) {
	for (var i = 0; i < num; i++) {
		randBlockType = getRandInteger(0,6);
		randBlockOrientation = getRandInteger(0, (listBlockTypes[randBlockType][1] - 1));
		blockQueue.push(new Block(listBlockTypes[randBlockType][0],9,3,randBlockOrientation));
	}
}

function buildBoardHtml() {
	for (var i = 0; i < boardHeight * 2; i++) {
		if (i % 2 == 0) {
			tetrisBoardHtml += `<tr class="mboard" id='r` + i + `'>`;
		}
		tetrisArray[i] = new Array(boardWidth);
		for (var j = 0; j < boardWidth * 2; j++) {
			if (i % 2 == 0 && j % 2 == 0) {
				tetrisBoardHtml += `<td class="mboard" id='c` + j + `-` + i + `'>`;
			}
			tetrisArray[i][j] = false;
		}
		tetrisBoardHtml += `</tr>`;
	}
	document.getElementById('board').innerHTML = tetrisBoardHtml;
}

function buildNextHtml() {
	for (var i = 0; i < bqLength; i++) {
		tetrisNextHtml += `<table id='n` + i + `'>`;
		for (var j = 0; j < 8; j++) {
			if (j % 2 == 0) {
				tetrisNextHtml += `<tr class="nboard" id='n` + i + `-` + j + `'>`;
			}
			for (var k = 0; k < 8; k++) {
				if (j % 2 == 0 && k % 2 == 0) {
					tetrisNextHtml += `<td class="nboard" id='n` + i + `-` + k + `-` + j + `'>`;
				}
			}
			tetrisNextHtml += `</tr>`;
		}
		tetrisNextHtml += `</table>`;
	}
	document.getElementById('nextup').innerHTML = tetrisNextHtml;
	for (var i = 0; i < 8; i++) {
		if (i % 2 == 0) {
			tetrisSwitchHtml += `<tr class="nboard" id='s` + i + `'>`;
		}
		for (var j = 0; j < 8; j++) {
			if (i % 2 == 0 && j % 2 == 0) {
				tetrisSwitchHtml += `<td class="nboard" id='s` + i + `-` + j + `'>`;
			}
		}
		// tetrisSwitchHtml += `</table>`
	}
	document.getElementById('switch').innerHTML = tetrisSwitchHtml;
}

function fullDraw() {
	for (var i = 0; i < boardHeight * 2; i+= 2) {
		for (var j = 0; j < boardWidth * 2; j+= 2) {
			if (tetrisArray[i][j] == false) {
				document.getElementById("c" + j + "-" + i).classList.remove("on");
				document.getElementById("c" + j + "-" + i).classList.add("off");
			} else if (tetrisArray[i][j] == true) {
				document.getElementById("c" + j + "-" + i).classList.remove("off");
				document.getElementById("c" + j + "-" + i).classList.add("on");
			} else {
				console.log("A tetris array value is neither true nor false.");
			}
		}
	}
	if (currentBlock != undefined) {
		for (var i = 0; i < currentBlock.ibcurrent.length; i++) {
			document.getElementById("c" + currentBlock.ibcurrent[i][0] + "-" + currentBlock.ibcurrent[i][1]).classList.add("on");
			document.getElementById("c" + currentBlock.ibcurrent[i][0] + "-" + currentBlock.ibcurrent[i][1]).classList.remove("off");
		}
	}
}

function nextDraw() {
	for (var i = 0; i < bqLength; i++) {
		for (var j = 0; j < 8; j += 2) {
			for (var k = 0; k < 8; k += 2) {
				document.getElementById("n" + i + "-" + k + "-" + j).classList.remove("on");
				document.getElementById("n" + i + "-" + k + "-" + j).classList.add("off");
			}
		}
		let ndBlocky = new BlockPreview(blockQueue[i].shapey,blockQueue[i].orientation);
		for (var j = 0; j < ndBlocky.ibcurrent.length; j++) {
			// console.log("n" + i + "-" + ndBlocky.ibcurrent[j][0] + "-" + ndBlocky.ibcurrent[j][1])
			document.getElementById("n" + i + "-" + ndBlocky.ibcurrent[j][0] + "-" + ndBlocky.ibcurrent[j][1]).classList.add("on");
			document.getElementById("n" + i + "-" + ndBlocky.ibcurrent[j][0] + "-" + ndBlocky.ibcurrent[j][1]).classList.remove("off");
		}
	}
	for (var i = 0; i < 8; i += 2) {
		for (var j = 0; j < 8; j += 2) {
			document.getElementById("s" + j + "-" + i).classList.remove("on");
			document.getElementById("s" + j + "-" + i).classList.add("off");
		}
	}
	if (blockSwitch != undefined) {
		for (var i = 0; i < blockSwitch.ibcurrent.length; i++) {
			document.getElementById("s" + blockSwitch.ibcurrent[i][1] + "-" + blockSwitch.ibcurrent[i][0]).classList.add("on");
			document.getElementById("s" + blockSwitch.ibcurrent[i][1] + "-" + blockSwitch.ibcurrent[i][0]).classList.remove("off");
		}
	}
}

function moveDownTest(obj) {
	if (isGamePlaying && !isGamePaused) {
		let testeroni = 0;
		for (var i = 0; i < obj.ibcurrent.length; i++) {
			let arghX = obj.ibcurrent[i][0];
			let arghY = obj.ibcurrent[i][1] + 2;
			if (obj.ibcurrent[i][1] + 2 > ((boardHeight - 1) * 2)) {
				break;
			} else if (tetrisArray[arghY][arghX] == true) {
				break;
			}
			testeroni++;
		}
		if (testeroni == obj.ibcurrent.length) {
			obj.moveDown();
		} else if (testeroni < obj.ibcurrent.length) {
			obj.settle();
			testClearLines();
			let testForForbidden = 0;
			for (var i = 0; i < obj.ibcurrent.length; i++) {
				if (obj.ibcurrent[i][1] <= (amountForbidden * 2) - 1) {
					break;
				}
				testForForbidden++;
			}
			if (testForForbidden < obj.ibcurrent.length) {
				endGame();
			} else {
				currentBlock = undefined;
				summonBlock();
			}
		}
		fullDraw();
	}
}

function moveSideTest(obj,dir) {
	if (isGamePlaying && !isGamePaused) {
		let testeroni = 0;
		let sidewaysNum = 0;
		switch(dir) {
			case "left":
				sidewaysNum = -2;
				break;
			case "l":
				sidewaysNum = -2;
				break;
			case "right":
				sidewaysNum = 2;
				break;
			case "r":
				sidewaysNum = 2;
				break;
			default:
				sidewaysNum = 0;
		}
		for (var i = 0; i < obj.ibcurrent.length; i++) {
			let arghX = obj.ibcurrent[i][0] + sidewaysNum;
			let arghY = obj.ibcurrent[i][1];
			if (obj.ibcurrent[i][0] + sidewaysNum > ((boardWidth - 1) * 2)) {
				break;
			} else if (obj.ibcurrent[i][0] + sidewaysNum < 0) {
				break;
			} else if (tetrisArray[arghY][arghX] == true) {
				break;
			}
			testeroni++;
		}
		if (testeroni == obj.ibcurrent.length) {
			obj.moveSide(sidewaysNum);
			fullDraw();
			panicWait();
		} else if (testeroni < obj.ibcurrent.length) {
			// don't
			fullDraw();
		}
	}
}

function rotateTest(obj,dir) {
	if (isGamePlaying && !isGamePaused) {
		let testBlock = new Block(obj.shapey,obj.center[0],obj.center[1],obj.orientation);
		let testeroni = 0;
		testBlock.rotate(dir);
		for (var i = 0; i < testBlock.ibcurrent.length; i++) {
			let arghX = testBlock.ibcurrent[i][0];
			let arghY = testBlock.ibcurrent[i][1];
			if (testBlock.ibcurrent[i][0] > ((boardWidth - 1) * 2)) {
				break;
			} else if (testBlock.ibcurrent[i][0] < 0) {
				break;
			} else if (tetrisArray[arghY][arghX] == true) {
				break;
			}
			testeroni++;
		}
		if (testeroni == obj.ibcurrent.length) {
			obj.rotate(dir);
			fullDraw();
			panicWait();
		} else if (testeroni < obj.ibcurrent.length) {
			fullDraw();
		}
	}
}

function summonBlock(type) {
	if (isGamePlaying && !isGamePaused) {
		if (type == "switch") {
			currentBlock = new Block(sbHolder.shapey,9,3,sbHolder.orientation);
		} else {
			currentBlock = blockQueue.shift();
			fillBlockQueue(1);
		}
		nextDraw();
		currentBlock.removeOffset();
		let testeroni = 0;
		for (var i = 0; i < currentBlock.ibcurrent.length; i++) {
			if (tetrisArray[currentBlock.ibcurrent[i][0]][currentBlock.ibcurrent[i][1]] == true) {
				break;
			}
			testeroni++;
		}
		if (testeroni < currentBlock.ibcurrent.length) {
			// end the game here
		}
		hasSwitched = false;
		fullDraw();
	}
}

function testClearLines() {
	for (var i = 0; i < boardHeight * 2; i++) {
		if (tetrisArray[i].filter(checkForTrue).length == 10) {
			tetrisArray.splice(i, 2);
			tetrisArray.unshift(new Array(boardWidth));
			tetrisArray.unshift(new Array(boardWidth));
			for (var j = 0; j < boardWidth * 2; j++) {
				tetrisArray[0][j] = false;
				tetrisArray[1][j] = false;
			}
			numLinesCleared++;
		}
	}
	document.getElementById("numLines").innerHTML = "Lines<br>" + numLinesCleared;
	decreaseInterval();
}

function keyInput(kp) {
	switch(kp.key) {
		case keyL:
			moveSideTest(currentBlock,"l");
			break;
		case keyR:
			moveSideTest(currentBlock,"r");
			break;
		case keyD:
			moveDownTest(currentBlock);
			break;
		case keyCW:
			rotateTest(currentBlock,"clockwise");
			break;
		case keyWS:
			rotateTest(currentBlock,"counterclockwise");
			break;
		case keyS:
			switchBlocks();
	}
}

function switchBlocks() {
	if (isGamePlaying && !isGamePaused) {
		if (hasSwitched == false) {
			if (blockSwitch == undefined) {
				blockSwitch = new BlockPreview(currentBlock.shapey,currentBlock.orientation);
				summonBlock();
				sbHolder = new BlockPreview(blockSwitch.shapey,blockSwitch.orientation);
			} else {
				blockSwitch = new BlockPreview(currentBlock.shapey,currentBlock.orientation);
				summonBlock("switch");
				sbHolder = new BlockPreview(blockSwitch.shapey,blockSwitch.orientation);
			}
			hasSwitched = true;
		}
		panicWait();
	}
}

function panicWait() {
	if (gameInterval != undefined) {
		window.clearTimeout(gameInterval.timerId);
		gameInterval = new RecurringTimer(() => {moveDownTest(currentBlock)},intervalRate);
	}
}

function endGame() {
	// body...
}

function decreaseInterval() {
	if (numLinesCleared >= currentReq) {
		window.clearTimeout(gameInterval.timerId);
		while (numLinesCleared >= currentReq) {
			intervalRate = Math.round(intervalRate / nRatio);
			levelNumber++;
			currentReq = Math.round(currentReq * (gRatio + 1));
		}
		if (isSoundEnabled) {
			soundLevelUp.play();
		}
		gameInterval = new RecurringTimer(() => {moveDownTest(currentBlock)},intervalRate);
		document.getElementById("numLevel").innerHTML = "Level<br>" + levelNumber;
	}
}

class BlockPreview {
	constructor(btype,o) {
		this.shapey = btype;
		this.orientation = o;
		if (btype == "t") {
			this.listofo = [
				[[-2,0], [0,0], [2,0], [0,2]], // T
				[[0,-2], [-2,0], [0,0], [0,2]], // + missing right arm
				[[0,-2], [-2,0], [0,0], [2,0]], // upside down T
				[[0,-2], [0,0], [2,0], [0,2]], // + missing left arm
			];
			this.listofc = [
				[2,2], [2,4], [4,4], [4,2]
			];
		} else if (btype == "o") {
			this.listofo = [
				[[-1,-1], [-1,1], [1,-1], [1,1]]
			];
			this.listofc = [
				[3,3]
			];
		} else if (btype == "i") {
			this.listofo = [
				[[0,-3], [0,-1], [0,1], [0,3]], // vertical
				[[-3,0], [-1,0], [1,0], [3,0]] // horizontal
			];
			this.listofc = [
				[2,3], [3,2]
			];
		} else if (btype == "l") {
			this.listofo = [
				[[-1,-2], [-1,0], [-1,2], [1,2]], // bottom left L
				[[-2,-1], [0,-1], [2,-1], [-2,1]], // top left L
				[[-1,-2], [1,-2], [1,0], [1,2]], // top right L
				[[2,-1], [-2,1], [0,1], [2,1]] // bottom right L
			];
			this.listofc = [
				[3,2], [4,3], [3,4], [2,3]
			];
		} else if (btype == "j") {
			this.listofo = [
				[[1,-2], [1,0], [1,2], [-1,2]], // bottom right J
				[[2,-1], [0,-1], [-2,-1], [2,1]], // top right J
				[[1,-2], [-1,-2], [-1,0], [-1,2]], // top left J
				[[-2,-1], [2,1], [0,1], [-2,1]] // bottom left J
			];
			this.listofc = [
				[3,4], [4,3], [3,2], [2,3]
			];
		} else if (btype == "s") {
			this.listofo = [
				[[0,-1], [2,-1], [-2,1], [0,1]], // S r-l
				[[-1,-2], [-1,0], [1,0], [1,2]] // S u-d
			];
			this.listofc = [
				[4,3], [3,4]
			];
		} else if (btype == "z") {
			this.listofo = [
				[[0,-1], [-2,-1], [2,1], [0,1]], // S r-l
				[[1,-2], [1,0], [-1,0], [-1,2]] // S u-d
			];
			this.listofc = [
				[2,3], [3,2]
			];
		}
		this.ibcurrent = [];
		for (var i = 0; i < this.listofo[o].length; i++) {
			this.ibcurrent.push([(this.listofo[o][i][0] + this.listofc[o][0]), (this.listofo[o][i][1] + this.listofc[o][1])]);
		}
	}
}

window.addEventListener("keydown", (kp) => {
	keyInput(kp);
});

function RecurringTimer(callback, delay) { // Modified version of code from Tim Down on StackOverflow
    this.startTimer = delay;
    this.remaining = delay;
    this.timerId = delay;

    this.pause = function() {
        window.clearTimeout(this.timerId);
        this.remaining -= new Date() - this.startTimer;
    };

    let resume = () => {
        this.startTimer = new Date();
        this.timerId = window.setTimeout(() => {
            this.remaining = delay;
            resume();
            callback();
        }, this.remaining);
    };

    this.resume = resume;

    this.resume();
}

function toggleSound() {
	if (isSoundEnabled) {
		isSoundEnabled = false;
		document.getElementById("soundtoggle").getAttributeNode("value").value = "Unmute";
	} else {
		isSoundEnabled = true;
		document.getElementById("soundtoggle").getAttributeNode("value").value = "Mute";
	}
}