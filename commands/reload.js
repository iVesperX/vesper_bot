import { failure, success } from '../util/reactor.js';
// import { ownerID } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

export const run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;
  if (!args || args.size < 1) return message.reply("Must provide a command name to reload.");

  const command = args[0];

  // the path is relative to the *current folder*, so just ./filename.js
  try {
    // tries to require the file
    delete pseudoRequire.cache[pseudoRequire.resolve(`./${command}.js`)];
  } catch(err) {
    return failure(message, `The command ${command} doesn\'t exist.`);
  }
  
  success(message, `The command ${command} has been reloaded.`);
});