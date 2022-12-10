import Phaser from "phaser";

type KeyMap = {
  [key: string]: Phaser.Input.Keyboard.Key;
};

export default class Demo extends Phaser.Scene {
  private _movementKeys!: KeyMap;
  private _player!: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
  private _text1!: Phaser.GameObjects.Text;
  private _text2!: Phaser.GameObjects.Text;
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

    this.input.mouse.disableContextMenu();

    this._text1 = this.add.text(10, 10, "", { color: "#00ff00" });
    this._text2 = this.add.text(500, 10, "", { color: "#00ff00" });

    this.input.mouse.disableContextMenu();

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonReleased()) {
        this._text2.setText("Left Button was released");
      } else if (pointer.rightButtonReleased()) {
        this._text2.setText("Right Button was released");
      } else if (pointer.middleButtonReleased()) {
        this._text2.setText("Middle Button was released");
      } else if (pointer.backButtonReleased()) {
        this._text2.setText("Back Button was released");
      } else if (pointer.forwardButtonReleased()) {
        this._text2.setText("Forward Button was released");
      }
    });
  }

  update() {
    this.handleMovementKeys();

    let pointer = this.input.activePointer;

    this._text1.setText([
      "x: " + pointer.worldX,
      "y: " + pointer.worldY,
      "isDown: " + pointer.isDown,
    ]);
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
