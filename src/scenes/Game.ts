import Phaser from "phaser";

export default class Demo extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("player", "assets/player.png");
  }

  create() {
    const player = this.physics.add.image(400, 300, "player");
  }
}
