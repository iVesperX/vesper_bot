import { success, failure } from '../util/reactor.js';
// import { ownerID } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

const code = '```';

export const run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;

  const send_param = (args[0] == '-s');
  const task = send_param ? args.slice(1).join(' ') : args.join(' ');
  // console.log(task);

  if (send_param) {
    try {
      const r = eval(task);

      message.channel.send(code + 'js\n' + (r ? r : 'undefined') + code).then(() => {
        success(message, 'Message string evaluated successfully.');
      }).catch(err => {
        console.log(err);
      });
    } catch(err) {
      failure(message, 'Error thrown trying to evaluate your message.');

      console.log(err);
    }
    
  } else {

    try {
      eval(task);
      success(message, 'Message string evaluated successfully.')
    } catch (err) {
      failure(message, 'Error thrown trying to evaluate your message.');

      console.log(err);
    }

  }
});