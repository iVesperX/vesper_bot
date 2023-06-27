import { SlashCommandBuilder } from 'discord.js';

export const commandBuilder = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Checks bot response time.'),

    async execute(interaction) {
      await interaction.reply(`Pong! \`${Date.now() - interaction.createdTimestamp}ms\` | Discord API Latency: \`${interaction.client.ws.ping}ms\``);
    }
}