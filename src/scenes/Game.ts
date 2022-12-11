import { Vector, VectorFactory } from "matter";
import Phaser from "phaser";

type KeyMap = {
  [key: string]: Phaser.Input.Keyboard.Key;
};

type LineProps = {
  gradient: number;
  yIntercept: number;
};

type Point = {
  x: number;
  y: number;
};

export default class Demo extends Phaser.Scene {
  private _movementKeys!: KeyMap;
  private _player!: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
  private _text1!: Phaser.GameObjects.Text;
  private _text2!: Phaser.GameObjects.Text;
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
    this._movementKeys = <KeyMap>this.input.keyboard.addKeys("W, S, A, D");

    this.input.mouse.disableContextMenu();

    this._text1 = this.add.text(10, 10, "", { color: "#00ff00" });
    this._text2 = this.add.text(500, 10, "", { color: "#00ff00" });

    this.input.mouse.disableContextMenu();

    this._mirrorLineCanvas = this.add.graphics();

    this._mirrorLineCanvas.lineStyle(2, 0x00ff00);

    //  The graphics instance you draw on

    let graphics = this.add.graphics();

    let line = new Phaser.Geom.Line();

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonReleased()) {
        this._text2.setText("Left Button was released");
        // let lineGradient = calculateLineGradient(
        //   { x: line.x1, y: line.y1 },
        //   { x: line.x2, y: line.y2 }
        // );

        // this.reflectPlayer(lineGradient, { x: line.x1, y: line.y1 });
        this.reflectPlayerWithVectors(line, {
          x: this._player.body.x,
          y: this._player.body.y,
        });
        graphics.clear();
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

      console.log("Left button down");
      line.x2 = pointer.x;
      line.y2 = pointer.y;

      graphics.clear();

      graphics.lineStyle(2, 0x00ff00);

      graphics.strokeLineShape(line);
    });
  }

  reflectPlayer(lineGradient: number, linePoint: Point) {
    // b = y-mx
    let yIntercept = linePoint.y - lineGradient * linePoint.x;

    // Adapted from: https://math.stackexchange.com/questions/1493765/finding-the-reflection-that-reflects-in-an-arbitrary-line-y-mxb
    let translationMapMatrix = new Phaser.Math.Matrix3();
    // prettier-ignore

    let unscaledReflectionFormulaMatrix = new Phaser.Math.Matrix3();
    // prettier-ignore
    unscaledReflectionFormulaMatrix.fromArray([
      1 - Math.pow(lineGradient, 2), 2 * lineGradient, -2 * lineGradient * yIntercept,
      2 * lineGradient, Math.pow(lineGradient, 2) - 1, 2 * yIntercept,
      0, 0, 1 + Math.pow(lineGradient, 2) 
    ]);

    let reflectionFormulaScale = Math.pow(1 + Math.pow(lineGradient, 2), -1);

    let reflectionMatrix = unscaledReflectionFormulaMatrix.scale(
      new Phaser.Math.Vector3(reflectionFormulaScale, 0, 0)
    );

    this._nextPlayerPosition = new Phaser.Math.Vector2(
      this._player.body.x,
      this._player.body.y
    ).transformMat3(reflectionMatrix);

    this._player.body.x = this._nextPlayerPosition.x;
    this._player.body.y = this._nextPlayerPosition.y;

    console.log(
      "Previous player position:",
      this._player.body.x,
      ",",
      this._player.body.y
    );

    this.logCurrentplayerPosition();
    console.log("Next player postiion:", this._nextPlayerPosition);
    this.logCurrentplayerPosition();
  }

  reflectPlayerWithVectors(line: Phaser.Geom.Line, playerStartPosition: Point) {
    // let mirrorIntersectLineProps = findLinePropsWithGradient()

    // 1. Get mirror line: y = mx + b
    let mirrorLineProps = findLineProps(line);
    console.log("Mirror line props:", mirrorLineProps);

    // 2. Line perpendcular to mirror line is y = -(1/m)x + b. Get the value of
    // b by substitiuting x and y with the player's position. b = y+(1/m)x
    let perpendicularLineProps = findPerpendicularLineProps(
      mirrorLineProps,
      playerStartPosition
    );

    // 3. Now equate the the two lines and get the point where they intercept
    let lineIntersectPoint = findLineIntersectPoint(
      mirrorLineProps,
      perpendicularLineProps
    );

    // Now to get the reflection point, create a vector from the the player position
    // to the intersect point then add this vector to the player position 2 times.
    // The final result will be the point where reflected player position.
    let playerPositionVector = new Phaser.Math.Vector2(
      playerStartPosition.x,
      playerStartPosition.y
    );
    let intersectPointVector = new Phaser.Math.Vector2(
      lineIntersectPoint.x,
      lineIntersectPoint.y
    );
    let shortestPlayerToMirrorLineVector =
      intersectPointVector.subtract(playerPositionVector);

    let reflectionPointVector = playerPositionVector.add(
      shortestPlayerToMirrorLineVector.scale(2)
    );
    this._isNewReflectionAvailable = true;
    this._nextPlayerPosition = new Phaser.Math.Vector2(reflectionPointVector);
  }

  update() {
    this.handleMovementKeys();

    let pointer = this.input.activePointer;

    this._text1.setText([
      "x: " + pointer.worldX,
      "y: " + pointer.worldY,
      "isDown: " + pointer.isDown,
    ]);

    if (!this._isNewReflectionAvailable) {
      return;
    }

    this._player.body.x = this._nextPlayerPosition.x;
    this._player.body.y = this._nextPlayerPosition.y;

    // console.log()
  }
  handleMovementKeys() {
    const PLAYER_VELOCITY = 150;

    // Handle horizontal and vertical axis seperately
    // to easily allow for diagonal movement.
    if (this._movementKeys.W.isDown) {
      this._player.body.setVelocityY(-PLAYER_VELOCITY);
      // this.logCurrentplayerPosition();
    } else if (this._movementKeys.S.isDown) {
      this._player.body.setVelocityY(PLAYER_VELOCITY);
      // this.logCurrentplayerPosition();
    } else {
      this._player.body.setVelocityY(0);
    }

    if (this._movementKeys.A.isDown) {
      this._player.body.setVelocityX(-PLAYER_VELOCITY);
      // this.logCurrentplayerPosition();
    } else if (this._movementKeys.D.isDown) {
      this._player.body.setVelocityX(PLAYER_VELOCITY);
      // this.logCurrentplayerPosition();
    } else {
      this._player.body.setVelocityX(0);
      // this.logCurrentplayerPosition();
    }
  }

  logCurrentplayerPosition() {
    console.log(
      "Current player position:",
      this._player.body.x,
      ",",
      this._player.body.y
    );
  }
}
function calculateLineGradient(point1: Point, point2: Point) {
  return point2.x - point1.x === 0
    ? 0
    : (point2.y - point1.y) / (point2.x - point1.x);
}
function findLineProps(line: Phaser.Geom.Line): LineProps {
  console.log("Line:", line);

  let lineGradient = calculateLineGradient(
    { x: line.x1, y: line.y1 },
    { x: line.x2, y: line.y2 }
  );

  let yIntercept = calculateYIntercept(lineGradient, {
    x: line.x1,
    y: line.y1,
  });

  return {
    gradient: lineGradient,
    yIntercept: yIntercept,
  };
}

function calculateYIntercept(lineGradient: number, pointOnLine: Point) {
  // Line: y = mx + b
  // b = y-mx
  return pointOnLine.y - lineGradient * pointOnLine.x;
}

function findPerpendicularLineProps(
  orginalLineProps: LineProps,
  pointOnPerpendicularLine: Point
): LineProps {
  // Gradient of perpendicular line is negative reciporical of original line gradient:
  // p = -(1/m)
  // Therefore the perpendicular line, the line equation is: y = px + c
  let lineGradient = -1 * Math.pow(orginalLineProps.gradient, -1);

  // c = y - px;
  let yIntercept =
    pointOnPerpendicularLine.y - lineGradient * pointOnPerpendicularLine.x;

  return {
    gradient: lineGradient,
    yIntercept: yIntercept,
  };
}

function findLineIntersectPoint(line1: LineProps, line2: LineProps): Point {
  // Equate y = mx + b to y = px + c
  // x = (c - b) / (m - p)
  let x =
    (line2.yIntercept - line1.yIntercept) / (line1.gradient - line2.gradient);

  // To get y, substitute x into one of the line equations.
  let y = line1.gradient * x + line1.yIntercept;
  return {
    x: x,
    y: y,
  };
}
