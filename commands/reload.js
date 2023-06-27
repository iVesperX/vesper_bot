import { SlashCommandBuilder } from 'discord.js';
import { resolved } from '../util/helper.js';
import { reloadCommand } from '../util/commands.js';
import config from '../storage/config.json' assert { type: 'json' };

export const commandBuilder = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command/all commands from the file system.')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('Specific command to reload (defaults to all if blank)')),

  async execute(interaction) {
    if (interaction.user.id != config.ownerID) {
      return interaction[resolved(interaction)]('This command is only available for the bot owner.');
    }

    const command = interaction.options.getString('command');

    try {
      reloadCommand(interaction.client, command);

      if (command) {
        interaction[resolved(interaction)](`Successfully reloaded ${command}!`);

      } else {
        interaction[resolved(interaction)](`Successfully reloaded all commands!`);
      }

    } catch(e) {
      console.error(e);
      interaction[resolved(interaction)](`Failed to reload command ${command}`);
    }
  }
}