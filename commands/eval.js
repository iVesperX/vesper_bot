import { SlashCommandBuilder, codeBlock } from 'discord.js';
import config from '../storage/config.json' assert { type: 'json' };

export const commandBuilder = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluates a script for the bot to execute.')
    .addStringOption(option =>
      option
        .setName('expression')
        .setDescription('JavaScript to execute.')
        .setRequired(true))
    .addBooleanOption(option =>
      option
        .setName('send')
        .setDescription('If the bot should send the output of the evaluation to the current channel.')),

    async execute(interaction) {
      if (interaction.user.id != config.ownerID) {
        return interaction.reply('This command is only available for the bot owner.');
      }

      const expression = interaction.options.getString('expression');
      const send_param = interaction.options.getBoolean('send');

      try {
        const client = interaction.client;
        const evaluation = eval(expression) || 'undefined';

        if (send_param) {
          interaction.reply(codeBlock('js', evaluation)).catch(err => console.log);
        }
      } catch(e) {
        interaction.channel.send('Error thrown trying to evaluate your message.').catch(err => console.log);
        console.log(e);
      }
    }
}