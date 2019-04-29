const reactor = require('../util/reactor.js');
const config = require('../storage/config.json');

exports.run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;
  if (!args || args.size < 1) return message.reply("Must provide a command name to reload.");

  const command = args[0];
  const commands = config.commands;

  // the path is relative to the *current folder*, so just ./filename.js
  try {
    // tries to require the file
    delete require.cache[require.resolve(`./${command}.js`)];
  } catch(err) {
    return reactor.failure(message, `The command ${command} doesn\'t exist.`);
  }
  
  reactor.success(message, `The command ${command} has been reloaded.`);
});