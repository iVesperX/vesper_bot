import { Collection } from 'discord.js';
import * as fs from 'fs';

export async function reloadCommand(client, command) {
  if (client.commands.size === 0 || !command || !client.commands.get(command)) {
    registerCommands(client);

  } else {
    const command_module = await import(`../commands/${command}.js?version=${Date.now()}`);

    if ('data' in command_module['commandBuilder'] && 'execute' in command_module['commandBuilder']) {
      client.commands.set(command_module['commandBuilder'].data.name, command_module);
    } else {
      console.log(`[WARNING] The command in ./commands/${command}.js is missing a required "data" or "execute" property.`);
    }
  }
}

export default function registerCommands(client) {
  client.commands = new Collection();

  // command registration
  fs.readdir('./commands/', null, async (err, files) => {
    if (err) return console.error(err);

    for (const file of files) {
      const command_module = await import(`../commands/${file}`);

      if ('data' in command_module['commandBuilder'] && 'execute' in command_module['commandBuilder']) {
        client.commands.set(command_module['commandBuilder'].data.name, command_module);
      } else {
        console.log(`[WARNING] The command in ./commands/${file}.js is missing a required "data" or "execute" property.`);
      }
    }
  });
}