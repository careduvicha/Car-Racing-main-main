var canvas;
var bgImage;
var bgImg;
var database;
var form, player,game;
var car1,carImg1,car2,carImg2,cars=[]
var track
var allPlayers
var fuels
var fuelImg
var coins
var coinsImg
var obstacles
var obstacle1Image
var obstacle2Image
var lifeImg
var blastImage

var playerCount = 0,gameState = 0;

function preload() {
  bgImage = loadImage("./assets/planodefundo.png");
  carImg1=loadImage("./assets/car1.png")
  carImg2=loadImage("./assets/car2.png")
  track=loadImage("./assets/track.jpg")
  fuelImg=loadImage("./assets/fuel.png")
  coinsImg=loadImage("./assets/goldCoin.png")
  obstacle1Image=loadImage("./assets/obstacle1.png")
  obstacle2Image=loadImage("./assets/obstacle2.png")
  lifeImg=loadImage("./assets/life.png")
  blastImage=loadImage("./assets/blast.png")

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState()
  game.start();

}

function draw() {
  background(bgImage);
  if(playerCount==2){
    game.updateState(1)
  }
  if(gameState==1){
    game.play()
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
