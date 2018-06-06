const reactor = require('../util/reactor.js');
const config = require('../config.json');

const code = '```';

exports.run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;

  const send_param = (args[0] == '-s');
  const task = send_param ? args.slice(1).join(' ') : args.join(' ');
  console.log(task);

  if (send_param) {
    try {
      const r = eval(task);

      message.channel.send(code + 'js\n' + (r ? r : 'undefined') + code).then(() => {
        reactor.success(message, 'Message string evaluated successfully.');
      }).catch(err => {
        console.log(err);
      });
    } catch(err) {
      reactor.failure(message, 'Error thrown trying to evaluate your message.');

      console.log(err);
    }
    
  } else {

    try {
      eval(task);
      reactor.success(message, 'Message string evaluated successfully.')
    } catch (err) {
      reactor.failure(message, 'Error thrown trying to evaluate your message.');

      console.log(err);
    }

  }
});