import Phaser from '/imports/startup/phaser-split'

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = '#EDEEC9'
  }

  preload() {
    let text = this.add.text(this.world.centerX, this.world.centerY, 'Hi there', { font: '16px Arial', fill: '#dddddd', align: 'center' })
    text.anchor.setTo(0.5, 0.5);
    // this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.scale.pageAlignHorizontally = true;
  }

  render() {
    if(Meteor.userId()){
      this.state.start('Splash')
    }
  }
}
