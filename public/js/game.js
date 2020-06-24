var config = {
    type: Phaser.CANVAS,
    width: 1200,
    height: 560,
    parent: 'my-phaser-game',
    physics: {
      default: 'arcade',
      arcade: {
          debug: true,
      }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    pixelArt: true
};

var game = new Phaser.Game(config);

function preload ()
{
  this.load.spritesheet('rockets', 'assets/sprites/rocketv3.png', { frameWidth: 64, frameHeight: 64 });
  this.load.image('bg','assets/tiles/background-sky.png');
  this.load.image('planet','assets/sprites/planet.png');

  this.load.audio('flightsong', 'assets/music/flightsong.wav');
}

// function playerCollide(){
//   console.log('player collided');
// }

function addPlayer(self, playerInfo, type) {
  if (type === "player"){
    self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'rockets',0);
    self.player.setCollideWorldBounds(true);
  } else {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'rockets', 0);
    otherPlayer.playerId = playerInfo.playerId;

    // self.physics.add.overlap(otherPlayer, self.player, playerCollide);
    self.otherPlayers.add(otherPlayer);
  }
}
function planetCollide() {
  console.log('planet collided');
}
function addPlanet(self, planetInfo){
  for (var p in planetInfo){
    var planet = self.physics.add.image(planetInfo[p].x, planetInfo[p].y, 'planet').setImmovable(false);
    self.physics.add.overlap(self.player, planet, planetCollide);
    self.planets.add(planet);
  }
}

function create ()
{
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.planets = this.physics.add.group();

    this.cameras.main.setBounds(0, 0, 1920 * 2, 1080 * 2);
    this.physics.world.setBounds(0, 0, 1920 * 2, 1080 * 2);
    this.add.image(0, 0, 'bg').setOrigin(0);
    this.add.image(1920, 0, 'bg').setOrigin(0).setFlipX(true);
    this.add.image(0, 1080, 'bg').setOrigin(0).setFlipY(true);
    this.add.image(1920, 1080, 'bg').setOrigin(0).setFlipX(true).setFlipY(true);

    music = this.sound.addf('flightsong');

    music.play();


    cursors = this.input.keyboard.createCursorKeys();


    this.socket.emit('getPlanets');

    this.socket.on('planets', function(planet_data) {
      addPlanet(self, planet_data);

    });


    this.socket.on('currentPlayers', function (players) {
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
          addPlayer(self, players[id], "player");
          self.cameras.main.startFollow(self.player, true);
          self.cameras.main.followOffset.set(0, 0);
        } else {
          addPlayer(self, players[id], "other")
        }
      });
    });

    this.socket.on('newPlayer', function (playerInfo) {
      addPlayer(self, playerInfo, "other");
    });


    this.socket.on('newPlanet', function (planetInfo) {
      console.log('added');
      addPlanet(self, planetInfo);

    });

    this.socket.on('disconnect', function (playerId) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
    this.socket.on('playerMoved', function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.angle);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);

          if (playerInfo.move === 'yes'){
            otherPlayer.anims.play('fly', true);
          } else {
            otherPlayer.anims.play('nofly', true);
          }

        }
      });
    });


    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNumbers('rockets', { start: 1, end: 10 }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'nofly',
        frames: [ { key: 'rockets', frame: 0 } ],
        frameRate: 20,
        repeat:-1,
    });
}

function test()
{
  console.log('collide');
}
function update ()
{
  if (this.player){
    this.player.setVelocity(0);
    var moving = false;
    var vel = 500;
    if (cursors.left.isDown)
    {
        this.player.setVelocityX(-1 * vel);
    }
    else if (cursors.right.isDown)
    {
        this.player.setVelocityX(vel);
    }


    if (cursors.up.isDown)
    {
        this.player.setVelocityY(-1 * vel);
    }
    else if (cursors.down.isDown)
    {
        this.player.setVelocityY(vel);
    }



    // emit player movement
    var x = this.player.x;
    var y = this.player.y;
    var r = this.player.body.angle + (Math.PI/2);
    if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y || r !== this.player.oldPosition.angle)) {
      this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, angle: this.player.body.angle + (Math.PI/2) , move:'yes'});
      moving = true;
    } else {
      this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, angle: this.player.body.angle + (Math.PI/2) , move:'no'});
    }


    if (moving){
      this.player.setRotation(this.player.body.angle + (Math.PI/2));
      this.player.anims.play('fly', true);
    } else {
      if (this.player.oldPosition){
        this.player.setRotation(this.player.oldPosition.angle);
      } else {
        this.player.setRotation(0);
      }
      this.player.anims.play('nofly',true);
    }

    // save old position data
    this.player.oldPosition = {
      x: this.player.x,
      y: this.player.y,
      angle: this.player.body.angle + (Math.PI/2)
    };
  }
}
