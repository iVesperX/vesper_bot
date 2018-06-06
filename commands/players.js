const config = require('../config.json');
const sqlite = require('sqlite');

exports.run = ((client, message, args) => {
  const reset_flag = '-r';

  sqlite.open(`./${config.db}`).then(() => {
    sqlite.get('SELECT * FROM players').then(row => {
      if (!row) {
        return message.channel.send('There are no players to clear.');
      }

      if (reset_flag == args[0]) {
        message.channel.send('Are you sure you want to remove all players and teams? Type the secret password to confirm or simply type \`NO\` to cancel this query.\n\n*__Note__: This action can not be undone.*').then(() => {
          const filter = (new_message => message.author.id == new_message.author.id);
          const collector = message.channel.createMessageCollector(filter);
  
          collector.on('collect', m => {
            if (m.content == config.pl_reset_pw) {
              sqlite.run('DELETE FROM players').then(() => {
                sqlite.run('DELETE FROM teams');
                message.channel.send('All players successfully cleared.');
              }).catch(err => {
                if (err) console.log(err);
                return message.channel.send('Unable to clear players list.');
              });
              
              collector.stop();
            } else if (m.content == 'NO') {
              message.channel.send('Query closed.');
              collector.stop();
            } else if (m.content.toUpperCase() == 'YES' || m.content.toUpperCase() == 'NO') {
              message.channel.send(`Query replies are case-sensitive. Type \`${m.content.toUpperCase()}\` to perform your action.`);
            } else {
              message.channel.send('Invalid input. Type \`NO\` to cancel the query.');
            }
          });
        });
      } else {
        sqlite.each('SELECT * FROM players', (err, row) => {
          console.log(row);
        });
      }
    }).catch(err => {
      console.log(err);
    });
  });
});