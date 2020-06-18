var config = {
  type: Phaser.AUTO,
  parent: 'phaser-game-box',
  width: 1200,
  height: 800,
  scale: {
        mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

function preload() {}

function create() {
  this.socket = io();
}

function update() {}
