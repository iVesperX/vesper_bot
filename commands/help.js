const Discord = require('discord.js');
const config = require('../storage/config.json');

exports.run = ((client, message, args) => {
  const command = args[0];
  const commands = config.commands;

  const get_access_level = (a => {
    let level = '';

    switch (a) {
      case 0: level = 'User'; break;
      case 1: level = 'Owner'; break;
      case 2: level = 'Permission'; break;
    }

    return level;
  });

  if (command) {
    // help command for another

    if (!commands[command]) return message.reply(`the command \`${command}\` cound not be resolved.`)

    let name = config.prefix + command,
        access = commands[command].access,
        description = commands[command].desc,
        use = commands[command].usage.split('|'),
        flags = commands[command].flags,
        flag_information = '';
    
    use = use.map(c => `\`${config.prefix + c}\``).join(', ');
    
    for (let i = 0; i < flags.length; i++) {
      flag_information += '\n';
      flag_information += `\`${flags[i].flag}\` : ${flags[i].desc} *${get_access_level(flags[i].access)} Level*`
    }

    flag_information = flag_information.length ? '__Flags__:\n' + flag_information : '';

    message.channel.send(
      `\`${name}\` : ${description} *${get_access_level(access)} Level*\n\n` +
      `Usage: ${use} \n${flag_information}`
    );
  } else {
    // help command alone
    const command_access = { user: [], permission: [], owner: [] };
    const role_color = (message.guild && !!message.guild.me.displayColor) ? message.guild.me.displayColor : 12172222;

    const help_menu = new Discord.RichEmbed();

    help_menu.setAuthor(`${client.user.username} Bot Help Menu`)
            .setDescription(`For information on a specific command, use ${config.prefix}help \`[command]\`.`)
            .setColor(role_color)
            .setThumbnail(client.user.avatarURL)
            .setFooter(client.user.tag, client.user.avatarURL)
            .setTimestamp(new Date());

    for (let i in commands) {
      let access = commands[i].access,
          access_level = '';
      
      if (i == 'default') continue;

      access_level = get_access_level(access);

      command_access[access_level.toLowerCase()].push(i);
    }

    let key_count = Object.keys(command_access).length,
        iterator = 0;

    for (let i in command_access) {
      help_menu.addField(
        `${i.charAt(0).toUpperCase() + i.slice(1)} Level Commands`,
        command_access[i].map(c => `\`${config.prefix + c}\``).join(', ') + (key_count != ++iterator ? '\n\u200B' : '')
      );
    }

    message.channel.send(help_menu);
  }
});