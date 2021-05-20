let fr = 33;
let img;
let xpos, ypos;
let xspeed = 3.5;
let yspeed = 3.5;
let xdir, ydir;
let randhue;
// let bridge;
// let song;

function preload() {
  img = loadImage('https://i.imgur.com/vKC0A5x.png');
  // bridge = loadSound('bridge.wav');
  // song = loadSound();
}

function setup() {
  createCanvas(400, 400);
  // H, S & B integer values
  colorMode(HSB);
  textFont("Comic Sans MS");
  textAlign(CENTER, CENTER)
  noSmooth();
  xpos = (width - 42) / 2;
  ypos = (height - 42) / 2;
  xdir = random();
  ydir = random();
  randhue = random(0, 360);
}

function draw() {
  if (frameCount % 24 == 0) {
    randhue = random(0, 360);
  }
  
  background(randhue, 50, 100);
  fill((randhue + 180) % 360, 100, 100);
  textSize(50);
  text("hello world*", 200, 50);
  textSize(25);
  text("*emphasis on hell", 200, 350)
  
  xpos = xpos + xspeed * xdir;
  ypos = ypos + yspeed * ydir;
  
  if (xpos > width - 42 || xpos < 0) {
    xdir *= -1;
  }
  if (ypos > height - 42 || ypos < 0) {
    ydir *= -1;
  }
  
  image(img, xpos, ypos)
}