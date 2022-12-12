import Phaser from "phaser";

const LINE_WIDTH = 2;
const LINE_COLOR = 0x00ff00;

export default class LineCanvas {
  private _canvas: Phaser.GameObjects.Graphics;
  private _line: Phaser.Geom.Line;

  constructor(scene: Phaser.Scene) {
    this._canvas = scene.add.graphics();
    this._line = new Phaser.Geom.Line();
  }

  startDrawing(startingPoint: Phaser.Math.Vector2) {
    this._line.setTo(
      startingPoint.x,
      startingPoint.y,
      startingPoint.x,
      startingPoint.y
    );
  }

  drawTo(endPoint: Phaser.Math.Vector2) {
    this._line.x2 = endPoint.x;
    this._line.y2 = endPoint.y;

    this.clear();
    this._canvas.lineStyle(LINE_WIDTH, LINE_COLOR);
    this._canvas.strokeLineShape(this._line);
  }

  getDrawing() {
    return this._line;
  }

  lineWasDrawn() {
    return !this._line.getPointA().equals(this._line.getPointB());
  }

  clear() {
    this._canvas.clear();
  }
}
