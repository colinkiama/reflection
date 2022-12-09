import Phaser from "phaser";

type KeyMap = {
  [key: string]: Phaser.Input.Keyboard.Key;
};

export default class Demo extends Phaser.Scene {
  private _movementKeys!: KeyMap;
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("player", "assets/player.png");
  }

  create() {
    const player = this.physics.add.image(400, 300, "player");
    this._movementKeys = <KeyMap>this.input.keyboard.addKeys("W, S, A, D");
  }

  update() {
    this.handleMovementKeys();
  }
  handleMovementKeys() {
    // console.log("Movment keys:", this._movementKeys);
    for (const key in this._movementKeys) {
      // console.log("Key:", key);
      let movementKey = this._movementKeys[key];
      if (movementKey.isDown) {
        console.log(`${key} is down: ${movementKey}`);
      }
      // console.log("Key:", key, ":", this._movementKeys[key]);
    }
  }
}
