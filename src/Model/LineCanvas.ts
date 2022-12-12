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
    this._line.setTo;
  }

  getDrawing() {
    return this._line;
  }

  clear() {
    this._canvas.clear();
  }
}
