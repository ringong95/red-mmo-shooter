import Phaser from '/imports/startup/phaser-split.js';
import Player from './../sprite/Player';
import DJ from './../sprite/DJ';
// import { fireButton } from './../methods/bullet.js';
export default class extends Phaser.State {
  init() {

  }
  preload() {
    this.load.image('bullet', 'img/bullet.png');
  }

  create() {

    this.stage.disableVisibilityChange = true;
    this.physics.startSystem(Phaser.Physics.ARCADE);

    // this.bullets = bulletFactory.create(this);

    // generate random starting x posiiton based on world width
    const x = Math.floor(Math.random() * this.world.width);
    const y = 50;

    // create player with starting position
    this.player = new Player({
      game: this,
      x,
      y,
      asset: 'player',
    });
    // create bullets with player position?

    // send server players coordinates to broadcast to all other clients
    Streamy.emit('newChallenger', { id: Streamy.id(), player: { x, y } });

    this.platforms = this.game.add.physicsGroup();
    this.platforms.create(50, 150, 'platform');
    this.platforms.setAll('body.immovable', true)

    this.djObjects = {};

    Streamy.on('createChallenger', d => {
      this.djObjects[d.challenger.id] = this.game.add.existing(new DJ({ game: this, x: d.challenger.player.x, y: d.challenger.player.y, asset: 'dj' }));
      this.physics.arcade.enable(this.djObjects[d.challenger.id]);
      Streamy.emit('createChallengerResponse', { newChallengerId: d.challenger.id, id: Streamy.id(), player: { x: this.player.x, y: this.player.y } });
    });

    Streamy.on('requestChallengers', d => {
      console.log('request Challenger');
      this.djObjects[d.challenger.id] = this.game.add.existing(new DJ({ game: this, x: d.challenger.player.x, y: d.challenger.player.y, asset: 'dj' }));
      this.physics.arcade.enable(this.djObjects[d.challenger.id]);
    });
    Streamy.on('spawnBullet',d =>{
      this.fireEvilBullet(d.data);
    } )
    this.firingTimer = 0;
    this.bulletTime = 0;
    this.createBulletSettings()

    // set physics on below entities and groups
    this.physics.arcade.enable([this.bullets, this.player, this.platforms]);
    this.player.body.collideWorldBounds = true;
    this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.game.add.existing(this.player);
    this.game.add.existing(this.bullets.getFirstExists(false));
    this.spawnDJ = false;
    this.spawnDJLocation = {};


    Streamy.on('spawnDJ', (d, s) => {
      this.spawnDJ = true;
      this.spawnDJLocation = { x: d.data.x, y: d.data.y };
    });

    Streamy.on('killDJ', (d, s) => {
      console.log(this.djObjects[d.data.id]);
    });


    music = this.game.add.audio('backgroundMusic');
    bulletFire = this.game.add.audio('bulletFire');
    music.loop = true;
    //music.play();

  }

  update() {

    this.game.physics.arcade.collide(this.player, this.platforms);

    //  Firing?
    if (this.fireButton.isDown) {
      this.fireBullet(this.player.facing);
    }


    this.physics.arcade.collide(this.bullets, this.platforms, this.collisionHandlerBulletPlatform, null, this);

    for (dj in this.djObjects) {
      if (this.physics.arcade.collide(this.bullets, this.djObjects[dj], this.collisionHandler2, this.collisionProccessor, this)) {
        Streamy.emit('DJDie', { id: Streamy.id(), data: { player: { x: this.djObjects[dj].x, y: this.djObjects[dj].y } }, id: dj });
      }
    }
  }


  collisionProccessor() {
    return true;
  }

  fireBullet(facing) {
    //  To avoid them being allowed to fire too fast we set a time limit
    if (this.game.time.now > this.bulletTime) {
      //  Grab the first bullet we can from the pool
      bullet = this.bullets.getFirstExists(false);
      bulletFire.play()
      if (bullet) {
        //  And fire it
        bullet.reset(this.player.x, this.player.y + 8);
        if (facing === 'left') {
          bullet.angle = -180;
          bullet.body.velocity.x = -400;
        }
        if (facing === 'right') {
          bullet.angle = 0;
          bullet.body.velocity.x = 400;
        }
        Streamy.emit('bulletFire', {data:{bulletx: this.player.x, bullety: this.player.y, facing }, id:Streamy.id() });

        this.bulletTime = this.game.time.now + 200;
      }
    }
  }

  //Cast Evil bullet flying
  fireEvilBullet({x, y, facing}) {
      bullet = this.DJbullets.getFirstExists(false);
      bulletFire.play()
      if (bullet) {
        //  And fire it
        bullet.reset(x, y + 8);
        if (facing === 'left') {
          bullet.angle = -180;
          bullet.body.velocity.x = -400;
        }
        if (facing === 'right') {
          bullet.angle = 0;
          bullet.body.velocity.x = 400;
        }
      }
  }
  resetBullet(bullet) {
    //  Called if the bullet goes out of the screen
    bullet.kill();

  }

  collisionHandler2(bullet, DJ) {
    //  When a bullet hits an alien DJ we kill them both
    DJ.kill();
    bullet.kill();
  }


  collisionHandlerBulletPlatform(bullet, platform) {
    //  When a bullet hits an alien DJ we kill them both
    bullet.kill();
  }

  collisionHandler(bullet, DJ) {
    //  When a bullet hits an DJ we kill them both
    Streamy.emit('DJDie', { data: { x: this.player.x, y: this.player.y } });

    bullet.kill();
    DJ.kill();
  }
  createBulletSettings() {
    // MY BULLETS
    this.bullets = this.add.group();
    this.bullets.enableBody = true;
    this.bullets.createMultiple(3, 'bullet');
    this.bullets.setAll('anchor.x', .5);
    this.bullets.setAll('anchor.y', .5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);

    // EVIL BULLETS
    this.DJbullets = this.add.group();
    this.DJbullets.enableBody = true;
    this.DJbullets.createMultiple(500, 'bullet');
    this.DJbullets.setAll('anchor.x', .5);
    this.DJbullets.setAll('anchor.y', .5);
    this.DJbullets.setAll('outOfBoundsKill', true);
    this.DJbullets.setAll('checkWorldBounds', true);
  }
  render() {
    // this.game.debug.body(this.dj);
    // this.game.debug.body(this.bullets);
    // this.game.debug.body(this.player);
  }
}

