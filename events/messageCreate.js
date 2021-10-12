const config = require('../storage/config.json'),
      prefix = process.env.prefix || config.prefix;

exports.run = ((client, message) => {
  const c = message.content;
  const args = c.split(' ');
  const command = args.shift().slice(prefix.length);
  const command_path = `../commands/${command}.js`;
  const maintenance = /⛔/i.test(client.user.username);
  
  if (c.indexOf(prefix) !== 0 || message.author.bot) return;

  const command_info = config.commands[command.toLowerCase()];
  
  if (command_info) {
    if (command_info.access != 0) {
      let m = (command_info.access == 1) ? 'Owner' : 'Permssion';
  
      if (command_info.access == 1 && config.ownerID != message.author.id || command_info.access == 2 && !config.accessIDs.includes(message.author.id)) {
        return message.channel.send(`The \`${command.toLowerCase()}\` command is only allowed at the **${m} Level**.`);
      }
    }
  } else {
    if (message.author.id != config.ownerID) return;
  }

  try {
    if (maintenance) return message.channel.send('Bot is down currently for maintenance.');
    let command_file = require(command_path);
    command_file.run(client, message, args);
    
    if (message.channel.type == 'dm' && message.author.id != config.ownerID) {
      const today = new Date();
      const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
      const dm_message = `<@${message.author.id}>: \`${c}\` (on ${formatted_date})`;

      if (config.bot_server) {
        client.channels.get(config.bot_server.mod.dms).send(dm_message);
      }
    }

  } catch (err) {
    const command_not_found = err.stack.indexOf(`\'${command_path}\'`) < 0;

    if (command_not_found) {
      console.log(`----\n[${prefix + command.charAt(0).toUpperCase() + command.slice(1)}] ${err.stack}`);
    } else {
      console.log(`----\nCommand \"${command}\" was not found.`);
    }
  }
});