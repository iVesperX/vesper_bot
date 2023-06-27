import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as fs from 'fs';
import storage from './storage/passwords-esv.json' assert { type: 'json' };

if (process.argv.length <= 2) {
  console.error('\nNo guild ID passed to deploy script. Correct format is \x1b[31mnpm run deploy [GUILD_ID]\x1b[0m')
  process.exit();
} 

const commands = [];

fs.readdir('./commands/', null, async (err, files) => {
  if (err) return console.error(err);
  
  for (const file of files) {
    const command_module = await import(`./commands/${file}`);
    
    if ('data' in command_module['commandBuilder'] && 'execute' in command_module['commandBuilder']) {
      commands.push(command_module['commandBuilder'].data.toJSON());
    } else {
      console.log(`[WARNING] The command in ./commands/${file}.js is missing a required "data" or "execute" property.`);
    }
  }

  const guild_id = process.argv[2];
  const rest = new REST({ version: '9' }).setToken(storage.token);
  
  console.log(`Deploying commands with client ID ${storage.clientID} and guild ID ${guild_id}...`);
  
  rest.put(Routes.applicationGuildCommands(storage.clientID, guild_id), { body: commands })
      .then(() => console.log('Successfully registered application commands.'))
      .catch(console.error);
});