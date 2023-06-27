import { success } from '../util/reactor.js';
// import { ownerID } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

export const run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;

  success(message, 'Connection terminated.', function() {
      client.destroy();
    });
});