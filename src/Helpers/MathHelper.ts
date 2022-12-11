import Phaser from "phaser";
import { LineProps } from "../types";

export default class MathHelper {
  static reflectPointOverLine(
    line: Phaser.Geom.Line,
    startingPoint: Phaser.Math.Vector2
  ): Phaser.Math.Vector2 {
    // Get mirror line: y = mx + b
    let mirrorLineProps = MathHelper.findLineProps(line);

    let lineIntersectPoint = MathHelper.calculateLineIntersectPoint(
      mirrorLineProps,
      startingPoint
    );

    // To get the reflection point, create a vector from the the starting position
    // to the intersect point then, add this vector to the starting position 2 times.
    //
    /// The final result will be the reflected poihnt.

    let shortestPlayerToMirrorLineVector = new Phaser.Math.Vector2(
      lineIntersectPoint
    ).subtract(startingPoint);

    let reflectionPointVector = new Phaser.Math.Vector2(startingPoint).add(
      new Phaser.Math.Vector2(shortestPlayerToMirrorLineVector).scale(2)
    );

    return reflectionPointVector;
  }

  static calculateLineGradient(
    point1: Phaser.Math.Vector2,
    point2: Phaser.Math.Vector2
  ) {
    return point2.x - point1.x === 0
      ? NaN
      : (point2.y - point1.y) / (point2.x - point1.x);
  }

  static findLineProps(line: Phaser.Geom.Line): LineProps {
    let lineGradient = MathHelper.calculateLineGradient(
      new Phaser.Math.Vector2(line.x1, line.y1),
      new Phaser.Math.Vector2(line.x2, line.y2)
    );

    let yIntercept = MathHelper.calculateYIntercept(
      lineGradient,
      new Phaser.Math.Vector2(line.x1, line.y1)
    );

    return {
      gradient: lineGradient,
      yIntercept: yIntercept,
      xConstant: Number.isNaN(lineGradient) ? line.x1 : NaN,
    };
  }

  static calculateYIntercept(
    lineGradient: number,
    pointOnLine: Phaser.Math.Vector2
  ) {
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

  static findPerpendicularLineProps(
    orginalLineProps: LineProps,
    pointOnPerpendicularLine: Phaser.Math.Vector2
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

  static findLineIntersectPoint(
    line1: LineProps,
    line2: LineProps
  ): Phaser.Math.Vector2 {
    // Equate y = mx + b to y = px + c
    // x = (c - b) / (m - p)
    let x =
      (line2.yIntercept - line1.yIntercept) / (line1.gradient - line2.gradient);

    // To get y, substitute x into one of the line equations.
    let y = line1.gradient * x + line1.yIntercept;
    return new Phaser.Math.Vector2(x, y);
  }

  static calculateLineIntersectPoint(
    mirrorLineProps: LineProps,
    playerStartPosition: Phaser.Math.Vector2
  ): Phaser.Math.Vector2 {
    // Edge case: Undefined mirror line gradient -> mirror line x value is constant
    if (Number.isNaN(mirrorLineProps.gradient)) {
      return new Phaser.Math.Vector2(
        mirrorLineProps.xConstant,
        playerStartPosition.y
      );
    }

    // Edge case: line gradient = 0 -> mirror line y value is constant
    if (mirrorLineProps.gradient === 0) {
      return new Phaser.Math.Vector2(
        playerStartPosition.x,
        mirrorLineProps.yIntercept
      );
    }

    // Now proceed to regular method of using vectors to find reflected point
    // Line perpendcular to mirror line is y = -(1/m)x + b. Get the value of
    // b by substitiuting x and y with the player's position. b = y+(1/m)x

    let perpendicularLineProps = MathHelper.findPerpendicularLineProps(
      mirrorLineProps,
      playerStartPosition
    );

    // Equate the the two lines and get the point where they intercept
    return MathHelper.findLineIntersectPoint(
      mirrorLineProps,
      perpendicularLineProps
    );
  }
}
