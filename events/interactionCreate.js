export const run = (async (client, interaction) => {
  if (!interaction.isChatInputCommand()) {
    return console.warn(`Received a non-chat interaction from ${interaction.user.username} (${interaction.user.id})`);
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return console.warn(`No command matching ${interaction.commandName} was found.`);
  }

  try {
    await command['commandBuilder'].execute(interaction);
  } catch(e) {
    console.error(e);

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: `There was an error while executing this command: ${e}`, ephemeral: true });
		} else {
			await interaction.reply({ content: `There was an error while executing this command: ${e}`, ephemeral: true });
		}
  }
});