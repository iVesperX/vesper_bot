import { MessageEmbed } from 'discord.js';
// import { commands, prefix } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

export const run = ((client, message, args) => {
  const command = args[0];

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

    if (!config.commands[command]) return message.reply(`the command \`${command}\` cound not be resolved.`)

    let name = config.prefix + command,
        access = config.commands[command].access,
        description = config.commands[command].desc,
        use = config.commands[command].usage.split('|'),
        flags = config.commands[command].flags,
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

    const help_menu = new MessageEmbed()
        .setAuthor(`${client.user.username} Bot Help Menu`) // change this in discord.js@13.5
        .setDescription(`For information on a specific command, use ${config.prefix}help \`[command]\`.`)
        .setColor(role_color)
        .setThumbnail(client.user.avatarURL)
        .setFooter(client.user.username, client.user.avatarURL) // change this in discord.js@13.5
        .setTimestamp(new Date());

    for (let i in config.commands) {
      let access = config.commands[i].access,
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

    message.channel.send({ embeds: [help_menu] });
  }
});