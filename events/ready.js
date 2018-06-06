exports.run = (client => {
  console.log('Vesper locked and loaded.');

  client.user.setPresence({
    game: { name: `${client.users.size} users | v!help`, type: 'LISTENING' },
    status: 'online'
  });
});