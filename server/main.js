import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup

  Streamy.on('clientMove', (d, s) => {
    Streamy.broadcast('movement', { data: { direction: d.data , id: d.id, x:d.data.x, y:d.data.y } }, d.id);
  });

  Streamy.on('DJDie', (d, s) => {
    Streamy.broadcast('killDJ', { data: { player: { x:d.data.x, y:d.data.y } }, id: d.data.id}, d.id)
  })

  Streamy.on('newChallenger', function(d, s) {
    Streamy.broadcast('createChallenger', { challenger: { id: d.id, player: {x: d.player.x, y:d.player.y } } }, d.id );
  })

  Streamy.on('createChallengerResponse', function(d, s) {
    Streamy.emit('requestChallengers', { challenger: { id: d.id, player: {x: d.player.x, y:d.player.y } } }, Streamy.sockets(d.newChallengerId))
  })

});

const connections = {};

Meteor.onConnection(() => {

})

