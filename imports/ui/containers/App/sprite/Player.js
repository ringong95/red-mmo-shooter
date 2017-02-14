import Phaser from '/imports/startup/phaser-split.js';
import DJ from './DJ';
export default class extends Phaser.Sprite {

  constructor({ game, x, y, asset }) {
    super(game, x, y, asset)
    this.cursors = game.input.keyboard.createCursorKeys()
    // this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.anchor.setTo(0.5)

    this.facing = "right"
  }

  update() {
    this.body.velocity.x = 0;
    this.body.gravity.y = 500;
    if (this.cursors.left.isDown) {
      this.facing = "left"
      this.body.velocity.x = -250;
    }
    if (this.cursors.right.isDown) {
      this.facing = "right" 
      this.body.velocity.x = 250;
    }
    if (this.cursors.up.isDown) {
      this.body.velocity.y = -250;
    }

    if (this.jumpButton.isDown && (this.body.onFloor() || this.body.touching.down)) {
      //Streamy.emit('clientMove', { id: Streamy.id(), data: {direction:'right', x: this.x, y:this.y} });
      this.body.velocity.y = -400;
    }

    if(this.body.velocity.x || this.body.velocity.y ){
    Streamy.emit('clientMove', { id: Streamy.id(), data: {direction:this.facing, x: this.x, y:this.y} });
    }
  }

}
