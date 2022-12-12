enum ScreenEdge {
  Top,
  Left,
  Bottom,
  Right,
}

const MIN_SPEED = 500;
const MAX_SPEED = 1500;

const MIN_INTRERVAL = 300; // Milliseconds
const MAX_INTERVAL = 3000; // Milliseconds

export default class EnemyPool {
  private _enemies: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[];
  private _player: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
  private _scene: Phaser.Scene;
  private gameOverText!: Phaser.GameObjects.Text;

  private static hasEnemyCollidedWithPlayer: boolean = false;

  constructor(
    scene: Phaser.Scene,
    player: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody
  ) {
    this._enemies = [];
    this._player = player;
    this._scene = scene;

    this.gameOverText = scene.add
      .text(400 - 40, 300 - 10, "Game Over", {
        color: "#000000",
      })
      .setDepth(2);

    this.gameOverText.visible = false;
  }

  private static pickScreenEdge() {
    let randomValue = Math.random();
    if (randomValue < 0.25) {
      return ScreenEdge.Top;
    } else if (randomValue < 0.5) {
      return ScreenEdge.Left;
    } else if (randomValue < 0.75) {
      return ScreenEdge.Bottom;
    } else {
      return ScreenEdge.Right;
    }
  }

  private static pickStartingPosition(
    screenEdge: ScreenEdge,
    scene: Phaser.Scene
  ): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      EnemyPool.pickStartingX(screenEdge, scene),
      EnemyPool.pickStartingY(screenEdge, scene)
    );
  }

  private static pickStartingX(
    screenEdge: ScreenEdge,
    scene: Phaser.Scene
  ): number {
    switch (screenEdge) {
      case ScreenEdge.Left:
        return -100;
      case ScreenEdge.Right:
        return scene.renderer.width + 100;
      default:
        return Math.random() * scene.renderer.width;
    }
  }

  private static pickStartingY(
    screenEdge: ScreenEdge,
    scene: Phaser.Scene
  ): number {
    switch (screenEdge) {
      case ScreenEdge.Top:
        return -100;
      case ScreenEdge.Bottom:
        return scene.renderer.width + 100;
      default:
        return Math.random() * scene.renderer.height;
    }
  }

  private static pickSpeed() {
    return Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
  }

  private static pickEnemySpawnInterval() {
    return Math.random() * (MAX_INTERVAL - MIN_INTRERVAL) + MIN_INTRERVAL;
  }

  start() {
    setTimeout(() => {
      if (EnemyPool.hasEnemyCollidedWithPlayer) {
        return;
      }

      this.fire(this._player.body.position);
      this.start();
    }, EnemyPool.pickEnemySpawnInterval());
  }

  fire(lastPlayerPosition: Phaser.Math.Vector2) {
    if (this._enemies.length > 10) {
      this.cleanUp();
    }

    let screenEdge = EnemyPool.pickScreenEdge();
    let startingPosition = EnemyPool.pickStartingPosition(
      screenEdge,
      this._scene
    );
    let flightDirection = new Phaser.Math.Vector2(lastPlayerPosition).subtract(
      startingPosition
    );

    let newEnemy = this._scene.physics.add.image(
      startingPosition.x,
      startingPosition.y,
      "enemy"
    );

    newEnemy.body.setImmovable(true);

    this._scene.physics.add.collider(newEnemy, this._player, (enemy, player) =>
      this.enemyHitPlayer()
    );

    newEnemy.body.velocity = flightDirection.scale(
      Math.pow(flightDirection.length(), -1) * EnemyPool.pickSpeed()
    );

    this._enemies.push(newEnemy);
  }
  enemyHitPlayer(): void {
    this._player.body.velocity.x = 0;
    this._player.body.velocity.y = 0;

    EnemyPool.hasEnemyCollidedWithPlayer = true;
    this.gameOverText.visible = true;
  }
  cleanUp() {
    let enemiesCleared = 0;
    for (let i = this._enemies.length - 1; i >= 0; i--) {
      let enemy = this._enemies.shift();
      enemy?.destroy();
      enemiesCleared++;

      if (this._enemies.length === 5) {
        break;
      }
    }
  }
}
