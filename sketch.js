let time;
let frameCountBuffer = 0;
let fps = 0;

const CANVAS_W = 960;
const CANVAS_H = 1280;

const GRID_SIZE = 64;
const GRID_W = 64;
const GRID_BASE_X = GRID_SIZE*2;
const GRID_BASE_Y = GRID_SIZE*4;

const BUTTON_W = GRID_SIZE*1.5;
const BUTTON_H = BUTTON_W/2;
const BUTTON_X = CANVAS_W-BUTTON_W;
const BUTTON_Y = CANVAS_H*2/3;
const BUTTON_M = 24;

const VIDEO_H = GRID_SIZE*8;

const JOYSTICK_X = GRID_SIZE*1;
//const JOYSTICK_X_SPAN = CANVAS_W-GRID_SIZE*2;
const JOYSTICK_Y = VIDEO_H*2+GRID_SIZE*1;
const JOYSTICK_SIZE = GRID_SIZE*2;
const JOYSTICK_RANGE = CANVAS_W-GRID_SIZE*2;

const REC_SIZE = 30;
let startButton;
let videoPlayButton;
let fwdButton, backButton;
let nextButton, prevButton;
let joystick;
let video;
let videoPlay = false;
let img;
let recVideo;
let recIndex = 0, recViewIndex = 0;
let recFlag = false;
let fileInput;

const DEBUG = true;
const DEBUG_VIEW_X = 40;
const DEBUG_VIEW_Y = 20;
const DEBUG_VIEW_H = 20;

function preload() {
	video = createVideo('./MOV_0634.mp4', videoLoaded);
}
function videoLoaded() {
	video.size(AUTO, VIDEO_H);
	video.hide();
//	startButton = buttonInit('START', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W)/2, BUTTON_Y-BUTTON_H*1.5);
//	startButton.mousePressed(startFn);
}
function startFn() {
//	video.elt.currentTime = video.elt.currentTime + 1/30;
//	console.log(video.elt.currentTime);
	if (videoPlay){
		video.pause();
	}
	recIndex = 0;
	recViewIndex = 0;
	recVideo = [];
	recFlag = true;
}
function videoPlayFn() {
	if (videoPlay){
		video.pause();
		videoPlay = false;
	}else{
		video.loop();
		videoPlay = true;
	}
}
function fwdFn() {
	if (video!=null){
		if (video.elt.currentTime+3<video.elt.duration){
			video.elt.currentTime = video.elt.currentTime+3;
		}
	}
}
function backFn() {
	if (video!=null){
		if (video.elt.currentTime-3>0){
			video.elt.currentTime = video.elt.currentTime-3;
		}else{
			video.elt.currentTime = 0;
		}
	}
}
function joystickInit() {
	joystick = {};
	joystick.pos = {};
	joystick.pos.x = JOYSTICK_X;
	joystick.pos.y = JOYSTICK_Y;
	joystick.offset = {};
	joystick.offset.x = 0;
	joystick.offset.y = 0;
	joystick.control = false;
}
function nextFn() {
	if (recVideo!=null){
		recViewIndex++;
		if (recViewIndex>=recVideo.length){
			recViewIndex = recVideo.length-1;
		}
	}
}
function prevFn() {
	if (recVideo!=null){
		recViewIndex--;
		if (recViewIndex<0){
			recViewIndex = 0;
		}
	}
}
function handleFile(file) {
	video = createVideo(file.data, videoLoaded);
}
function setup() {
	video.elt.muted = true;
	createCanvas(CANVAS_W, CANVAS_H);
	time = millis();
	joystickInit();
	rectMode(CENTER);

	startButton = buttonInit('start', BUTTON_W, BUTTON_H, BUTTON_X, GRID_SIZE*3);
	startButton.mousePressed(startFn);
	videoPlayButton = buttonInit('play', BUTTON_W, BUTTON_H, BUTTON_X, GRID_SIZE*1);
	videoPlayButton.mousePressed(videoPlayFn);
	fwdButton = buttonInit('+3sec', BUTTON_W, BUTTON_H, BUTTON_X, GRID_SIZE*5);
	fwdButton.mousePressed(fwdFn);
	backButton = buttonInit('-3sec', BUTTON_W, BUTTON_H, BUTTON_X, GRID_SIZE*7);
	backButton.mousePressed(backFn);
	nextButton = buttonInit('next', BUTTON_W, BUTTON_H, BUTTON_X, GRID_SIZE*10);
	nextButton.mousePressed(nextFn);
	prevButton = buttonInit('prev', BUTTON_W, BUTTON_H, BUTTON_X, GRID_SIZE*12);
	prevButton.mousePressed(prevFn);
	textAlign(CENTER,CENTER);
	fileInput = createFileInput(handleFile);
	fileInput.style('font-size', '32px');
	fileInput.position(GRID_SIZE/2, CANVAS_H-GRID_SIZE);
}
function buttonInit(text, w, h, x, y) {
	let button = createButton(text);
	button.size(w,h);
	button.position(x,y);
	button.style('font-size', '32px');
	return button;
}
function draw() {
	background(48);
	let current = millis();
	if ( (current-time)>=1000 ){
		time += 1000;
		fps = frameCount - frameCountBuffer;
		frameCountBuffer = frameCount;
	}
	if (DEBUG){
		stroke(128);
		strokeWeight(1);
		for (let i=0; i<CANVAS_H/GRID_SIZE; i++){
			line(0, i*GRID_SIZE, CANVAS_W, i*GRID_SIZE);
		}
		for (let i=0; i<CANVAS_W/GRID_SIZE; i++){
			line(i*GRID_SIZE, 0, i*GRID_SIZE, CANVAS_H);
		}
	}
	if (joystick.control){
		if (joystick.pos.x>=JOYSTICK_X+JOYSTICK_RANGE){
			joystick.pos.x = JOYSTICK_X+JOYSTICK_RANGE;
		}else if(joystick.pos.x<=JOYSTICK_X){
			joystick.pos.x = JOYSTICK_X;
		}
		joystick.x = (joystick.pos.x-JOYSTICK_X)/JOYSTICK_RANGE;
		if (recVideo!=null){
			recViewIndex = int((recVideo.length-1)*joystick.x);
		}
	}else{
		if (recVideo!=null){
			joystick.x = recViewIndex/(recVideo.length);
		}else{
			joystick.x = 0;
		}
		joystick.pos.x = JOYSTICK_X+JOYSTICK_RANGE*joystick.x;
	}
//	img = video.get();
	image(video, 0, 0);

	if(recFlag){
		if (!video.elt.seeking){
//			recVideo[recIndex] = img;
			recVideo[recIndex] = video.get();
			recIndex++;
			if (recIndex>=REC_SIZE){
				recFlag = false;
			}
			video.elt.currentTime = video.elt.currentTime + 1/30;
		}
	}else{
		if (recVideo!=null){
			image(recVideo[recViewIndex], 0, VIDEO_H);
		}
	}
	fill(200);
	noStroke();
	circle(joystick.pos.x, joystick.pos.y, JOYSTICK_SIZE);
	fill(255);
	stroke(255);
	textSize(16);
	strokeWeight(1);
	let debugY = DEBUG_VIEW_Y;
	text('fps:'+fps, DEBUG_VIEW_X, debugY);
	debugY += DEBUG_VIEW_H;
	text(joystick.x.toFixed(2), DEBUG_VIEW_X, debugY);
}
function touchStarted() {
	let tp = [];
	for (let i=0; i<touches.length;i++) {
		if (tp[i]==null){
			tp[i] = [];
		}
		tp[i].x = touches[i].x;
		tp[i].y = touches[i].y;
	}
	let tx, ty;
	if (tp[0]!=null){
		tx = tp[0].x;
		ty = tp[0].y;
	}else{
		tx = mouseX;
		ty = mouseY;
	}
	const d = dist(tx, ty, joystick.pos.x, joystick.pos.y);
	if (d<=JOYSTICK_SIZE/2){
		joystick.control = true;
		joystick.offset.x = joystick.pos.x - tx;
		joystick.offset.y = joystick.pos.y - ty;
	}
}
function touchEnded() {
	joystick.control = false;
}
function touchMoved() {
	let tp = [];
	for (let i=0; i<touches.length;i++) {
		if (tp[i]==null){
			tp[i] = [];
		}
		tp[i].x = touches[i].x;
		tp[i].y = touches[i].y;
	}
	let tx, ty;
	if (tp[0]!=null){
		tx = tp[0].x;
		ty = tp[0].y;
	}else{
		tx = mouseX;
		ty = mouseY;
	}
	if (joystick.control){
		joystick.pos.x = tx + joystick.offset.x;
//		joystick.pos.y = ty + joystick.offset.y;
	}
	return false;
}