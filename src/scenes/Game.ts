import Phaser from "phaser";

type KeyMap = {
  [key: string]: Phaser.Input.Keyboard.Key;
};

export default class Demo extends Phaser.Scene {
  private _movementKeys!: KeyMap;
  private _player!: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("player", "assets/player.png");
  }

  create() {
    this._player = this.physics.add.image(400, 300, "player");
    this._player.body.setCollideWorldBounds(true);
    this._movementKeys = <KeyMap>this.input.keyboard.addKeys("W, S, A, D");
  }

  update() {
    this.handleMovementKeys();
  }
  handleMovementKeys() {
    const PLAYER_VELOCITY = 150;

    // Handle horizontal and vertical axis seperately
    // to easily allow for diagonal movement.
    if (this._movementKeys.W.isDown) {
      this._player.body.setVelocityY(-PLAYER_VELOCITY);
    } else if (this._movementKeys.S.isDown) {
      this._player.body.setVelocityY(PLAYER_VELOCITY);
    } else {
      this._player.body.setVelocityY(0);
    }

    if (this._movementKeys.A.isDown) {
      this._player.body.setVelocityX(-PLAYER_VELOCITY);
    } else if (this._movementKeys.D.isDown) {
      this._player.body.setVelocityX(PLAYER_VELOCITY);
    } else {
      this._player.body.setVelocityX(0);
    }
  }
}
