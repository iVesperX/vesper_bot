const config = require('../config.json');

exports.run = ((client, message) => {
  const c = message.content;
  const args = c.split(' ');
  const command = args.shift().slice(config.prefix.length);
  const command_path = `../commands/${command}.js`;
  
  if (c.indexOf(config.prefix) !== 0 || message.author.bot) return;

  try {
    let command_file = require(command_path);
    command_file.run(client, message, args);
    
    if (message.channel.type == 'dm' && message.author.id != config.ownerID) {
      const today = new Date();
      const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
      const dm_message = `<@${message.author.id}>: \`${c}\` (on ${formatted_date})`;

      client.channels.get(config.bot_server.mod.dms).send(dm_message);
    } else if (!config.accessIDs.includes(message.author.id)) {
      const m = `<@${message.author.id}>: \`${c}\` (in <#${channel.id}> of ${channel.guild.name})`;
      client.channels.get(config.bot_server.mod.all).send(dm_message);
    }

  } catch (err) {
    const command_not_found = err.stack.indexOf(`\'${command_path}\'`) < 0;

    if (command_not_found) {
      console.log(`----\n[${config.prefix + command.charAt(0).toUpperCase() + command.slice(1)}] ${err.stack}`);
    } else {
      console.log(`----\nCommand \"${command}\" was not found.`);
    }
  }
});