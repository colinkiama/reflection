import Phaser from "phaser";
import EnemyPool from "../Helpers/EnemyPool";
import MathHelper from "../Helpers/MathHelper";
import LineCanvas from "../Model/LineCanvas";

export default class Demo extends Phaser.Scene {
  private _player!: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
  private _mirrorLineCanvas!: LineCanvas;
  private _nextPlayerPosition!: Phaser.Math.Vector2;
  private _isNewReflectionAvailable!: boolean;
  private _enemyPool!: EnemyPool;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("player", "assets/player.png");
    this.load.image("enemy", "assets/enemy.png");
  }

  create() {
    this._player = this.setupPlayer();
    this._isNewReflectionAvailable = false;
    this.input.mouse.disableContextMenu();
    this._mirrorLineCanvas = new LineCanvas(this);

    this._enemyPool = new EnemyPool(this, this._player);
    this._enemyPool.start();
    let enemy = this.physics.add.image(500, 500, "enemy");

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonReleased()) {
        if (!this._mirrorLineCanvas.lineWasDrawn()) {
          this._mirrorLineCanvas.clear();
          return;
        }

        this.reflectPlayer(
          this._mirrorLineCanvas.getDrawing(),
          new Phaser.Math.Vector2(this._player.body.position)
        );

        this._mirrorLineCanvas.clear();
      }
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) {
        return;
      }

      if (!pointer.leftButtonDown()) {
        return;
      }

      this._mirrorLineCanvas.startDrawing(
        new Phaser.Math.Vector2(pointer.x, pointer.y)
      );
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) {
        return;
      }

      // Ensures that primary button is held down
      // and is the most recently preseed button
      // before continuing.
      if (!pointer.primaryDown && pointer.button !== 0) {
        return;
      }

      this._mirrorLineCanvas.drawTo(
        new Phaser.Math.Vector2(pointer.x, pointer.y)
      );
    });
  }
  setupPlayer(): Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody {
    let player = this.physics.add.image(400, 300, "player");
    player.body.setCollideWorldBounds(true);
    return player;
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
    this._isNewReflectionAvailable = false;
  }
}
