const reactor = require('../util/reactor.js');
const config = require('../config.json');

exports.run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;

  reactor.success(message, 'Connection terminated.', function() {
      client.destroy();
    });
});