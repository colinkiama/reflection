import { Vector, VectorFactory } from "matter";
import Phaser from "phaser";

type KeyMap = {
  [key: string]: Phaser.Input.Keyboard.Key;
};

type LineProps = {
  gradient: number;
  yIntercept: number;
  xConstant: number;
};

type Point = {
  x: number;
  y: number;
};

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
        this.reflectPlayer(line, {
          x: this._player.body.x,
          y: this._player.body.y,
        });

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

  reflectPlayer(line: Phaser.Geom.Line, playerStartPosition: Point) {
    // Get mirror line: y = mx + b
    let mirrorLineProps = findLineProps(line);

    let lineIntersectPoint = calculateLineIntersectPoint(
      mirrorLineProps,
      playerStartPosition
    );

    // To get the reflection point, create a vector from the the player position
    // to the intersect point then, add this vector to the player position 2 times.
    //
    /// The final result will be the reflected player position.
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
    if (!this._isNewReflectionAvailable) {
      return;
    }

    this._player.body.x = this._nextPlayerPosition.x;
    this._player.body.y = this._nextPlayerPosition.y;
  }
}

function calculateLineGradient(point1: Point, point2: Point) {
  return point2.x - point1.x === 0
    ? NaN
    : (point2.y - point1.y) / (point2.x - point1.x);
}

function findLineProps(line: Phaser.Geom.Line): LineProps {
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
    xConstant: Number.isNaN(lineGradient) ? line.x1 : NaN,
  };
}

function calculateYIntercept(lineGradient: number, pointOnLine: Point) {
  // Line: y = mx + b
  // b = y-mx
  if (Number.isNaN(lineGradient)) {
    return NaN;
  }

  if (lineGradient === 0) {
    // y is constant so y = pointOnline.y
    return pointOnLine.y;
  }

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
    xConstant: NaN, // If method is used, this field will be unused
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

function calculateLineIntersectPoint(
  mirrorLineProps: LineProps,
  playerStartPosition: Point
): Point {
  // Edge case: Undefined mirror line gradient -> mirror line x value is constant
  if (Number.isNaN(mirrorLineProps.gradient)) {
    return {
      x: mirrorLineProps.xConstant,
      y: playerStartPosition.y,
    };
  }

  // Edge case: line gradient = 0 -> mirror line y value is constant
  if (mirrorLineProps.gradient === 0) {
    return {
      x: playerStartPosition.x,
      y: mirrorLineProps.yIntercept,
    };
  }

  // Now proceed to regular method of using vectors to find reflected point
  // Line perpendcular to mirror line is y = -(1/m)x + b. Get the value of
  // b by substitiuting x and y with the player's position. b = y+(1/m)x

  let perpendicularLineProps = findPerpendicularLineProps(
    mirrorLineProps,
    playerStartPosition
  );

  // Equate the the two lines and get the point where they intercept
  return findLineIntersectPoint(mirrorLineProps, perpendicularLineProps);
}
