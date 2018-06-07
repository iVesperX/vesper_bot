exports.run = (client => {
  console.log('Vesper locked and loaded.');

  client.user.setPresence({
    game: { name: `${client.users.size} users | ${config.prefix}help`, type: 'LISTENING' },
    status: 'online'
  });
});