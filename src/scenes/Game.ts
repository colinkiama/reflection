import Phaser from "phaser";
import MathHelper from "../Helpers/MathHelper";

export default class Demo extends Phaser.Scene {
  private _player!: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
  private _mirrorLineCanvas!: Phaser.GameObjects.Graphics;
  private _nextPlayerPosition!: Phaser.Math.Vector2;
  private _isNewReflectionAvailable!: boolean;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("player", "assets/player.png");
  }

  create() {
    this._player = this.physics.add.image(400, 300, "player");
    this._player.body.setCollideWorldBounds(true);
    this._isNewReflectionAvailable = false;

    this.input.mouse.disableContextMenu();

    this.input.mouse.disableContextMenu();

    this._mirrorLineCanvas = this.add.graphics();

    this._mirrorLineCanvas.lineStyle(2, 0x00ff00);

    //  The graphics instance you draw on

    let graphics = this.add.graphics();

    let line = new Phaser.Geom.Line();

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonReleased()) {
        this.reflectPlayer(
          line,
          new Phaser.Math.Vector2(this._player.body.position)
        );

        graphics.clear();
      }
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) {
        return;
      }

      if (!pointer.leftButtonDown()) {
        return;
      }

      line.setTo(pointer.x, pointer.y, pointer.x, pointer.y);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) {
        graphics.clear();
        return;
      }

      if (!pointer.leftButtonDown()) {
        graphics.clear();
        return;
      }

      line.x2 = pointer.x;
      line.y2 = pointer.y;

      graphics.clear();

      graphics.lineStyle(2, 0x00ff00);

      graphics.strokeLineShape(line);
    });
  }

  reflectPlayer(
    line: Phaser.Geom.Line,
    playerStartPosition: Phaser.Math.Vector2
  ) {
    this._isNewReflectionAvailable = true;
    this._nextPlayerPosition = MathHelper.reflectPointOverLine(
      line,
      playerStartPosition
    );
  }

  update() {
    if (!this._isNewReflectionAvailable) {
      return;
    }

    this._player.body.x = this._nextPlayerPosition.x;
    this._player.body.y = this._nextPlayerPosition.y;
  }
}
