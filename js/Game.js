class Game {
  constructor() {
    this.resetButton = createButton("");
    this.resetTitle = createElement("h2");
    this.leaderBoardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playerMoving = false
    this.leftKeyActive = false
    this.blast = false
  }

  start() {
    player = new Player();
    playerCount = player.getCount();
    form = new Form();
    form.display();
    this.spriteCreate();
  }
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x;
      var y;
      if (positions.length > 0) {
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      } else {
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }

      var sprite = createSprite(x, y);
      sprite.addImage(spriteImage);
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }
  spriteCreate() {
    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", carImg1);
    car1.addImage("blast",blastImage)
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", carImg2);
    car2.addImage("blast",blastImage)
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels = new Group();
    coins = new Group();
    obstacles = new Group();
    this.addSprites(coins, 18, coinsImg, 0.09);
    this.addSprites(fuels, 4, fuelImg, 0.02);
 
    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image },
    ];
    this.addSprites(obstacles,obstaclesPositions.length,obstacle1Image,0.04,obstaclesPositions)
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", (data) => {
      gameState = data.val();
    });
  }

  updateState(state) {
    var gameStateRef = database.ref("/");
    gameStateRef.update({
      gameState: state,
    });
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.position(width / 2 + 200, 40);
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");

    this.resetButton.position(width / 2 + 230, 100);
    this.resetButton.class("resetButton");

    this.leaderBoardTitle.position(width / 3 - 60, 40);
    this.leaderBoardTitle.html("LeaderBoard");
    this.leaderBoardTitle.class("resetText");

    this.leader1.position(width / 3 - 50, 80);
    this.leader1.class("leadersText");

    this.leader2.position(width / 3 - 50, 130);
    this.leader2.class("leadersText");
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();
    player.getCarsAtEnd()

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);
      this.showLeaderBoard();
      this.showLife()
      this.showFuelBar()
      var index = 0;
      for (const plr in allPlayers) {
        index += 1;
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;
        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;
        var currentLife=allPlayers[plr].life
        if(currentLife<=0){
          cars[index-1].changeImage("blast")
          cars[index-1].scale=0.3
        }
        if (index == player.index) {
          fill("blue");
          stroke(10);
          ellipse(x, y, 70, 80);
          this.handleCoins(index)
          this.handleFuel(index)
          this.handleObstaclesCollision(index)
          this.handleCarsCollision(index)
          if(player.life<=0){
            this.blast=true
            this.playerMoving=false
            
            setTimeout(() => {
              gameState=2
              this.gameOver()
            }, 2000);
            
          }

          camera.position.y = cars[index - 1].position.y;
        }
      }
      this.handlePlayerControls();
      const finishLine=height*6-100
      if(player.positionY>finishLine){
        gameState=2
        player.ranking+=1
        player.updateCarsAtEnd(player.ranking)
        player.update()
        this.showRank()

      }
      if(this.playerMoving){
        player.positionY+=5
        player.update() 
      }
      drawSprites();
    }
  }
  handlePlayerControls() {
    if(!this.blast){
      if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
        this.playerMoving=true
        player.update();
      }
      if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
        player.positionX += 5;
        this.leftKeyActive=false
        player.update();
      }
      if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
        player.positionX -= 5;
        this.leftKeyActive=true
        player.update();
      }
    }
   
  }
  showLeaderBoard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].ranking == 0 && players[1].ranking == 0) ||
      players[0].ranking == 1
    ) {
      leader1 =
        players[0].ranking +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
      leader2 =
        players[1].ranking +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }
    if (players[1].ranking == 1) {
      leader2 =
        players[0].ranking +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
      leader1 =
        players[1].ranking +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }
    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }
  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd: 0,
      });
      window.location.reload();
    });
  }
  handleFuel(index){
    cars[index-1].overlap(fuels,function(collector,collected){
      player.fuel=185
      collected.remove()
    })
    if(player.fuel>0&&this.playerMoving){
      player.fuel-=0.4
    }
    if(player.fuel<=0){
      gameState=2
      this.fuelOver()
    }
    
  }
  handleCoins(index){
    cars[index-1].overlap(coins,function(collector,collected){
      player.score+=20
      player.update()
      collected.remove()
    })

  }
  showRank() {
    swal({
      //title: Incrível!${"\n"}Rank${"\n"}${player.rank},
      title: `Incrível,${player.name}!${"\n"}${player.ranking}º lugar`,
      text: "Você alcançou a linha de chegada com sucesso!",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    swal({
      title: `Fim de Jogo`,
      text: `Oops, ${player.name} você não chegou ao fim ;-;`,
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Obrigado por jogar"
    });
  }
  showLife(){
    push()
    image(lifeImg,width/2-130,height-player.positionY-300,20,20)
    noStroke()
    fill("white")
    rect(width/2-100,height-player.positionY-300,185,20)
    fill("red")
    rect(width/2-100,height-player.positionY-300,player.life,20)
   

    pop()
  }
  showFuelBar(){
    push()
    image(fuelImg,width/2-130,height-player.positionY-250,20,20)
    noStroke()
    fill("white")
    rect(width/2-100,height-player.positionY-250,185,20)
    fill("gold")
    rect(width/2-100,height-player.positionY-250,player.fuel,20)

    pop()
  }
  fuelOver(){
    swal({
      title: `Fim de Jogo`,
      text: `Oops, ${player.name} você ficou sem combustivel!`,
      imageUrl:"../assets/fuel.png",
        
      imageSize: "100x100",
      confirmButtonText: "Obrigado por jogar"
    });
  }
  handleObstaclesCollision(index){
    if(cars[index-1].collide(obstacles)){
      if(this.leftKeyActive){
        player.positionX+=100
      }else{
        player.positionX-=100
      }
      if(player.life>0){
        player.life-=185/4
        
      }
      player.update()
    }

  }
  handleCarsCollision(index){
    if(index==1){
      if(cars[index-1].collide(cars[1])){
        if(this.leftKeyActive){
          player.positionX+=100
        }else{
          player.positionX-=100
        }
        if(player.life>0){
          player.life-=185/4
          
        }
        player.update()}
    }
    if(index==2){
      if(cars[index-1].collide(cars[0])){
        if(this.leftKeyActive){
          player.positionX+=100
        }else{
          player.positionX-=100
        }
        if(player.life>0){
          player.life-=185/4
          
        }
        player.update()}
    }

  }
  
}
