const sqlite = require('sqlite');
const config = require('../config.json');

exports.run = ((client, message, args) => {
  const team = args.join(' ');
  const format =  `\`${config.prefix}removeteam {name}\``;

  if (message.author.id != config.ownerID) return;

  if (!args.length) {
    return message.channel.send('Choose a team to remove.')
  }

  sqlite.open(`./${config.db}`).then(() => {
    sqlite.get(`SELECT * FROM teams WHERE team_name = "${team}"`).then(row => {
      if (row) {
        sqlite.run(`DELETE FROM teams WHERE team_name = "${team}"`).then(() => {
          message.channel.send(`${team} has been successfully removed from PL.`);
        });
      } else {
        message.channel.send(`Team ${team} does not exist.`);
      }
    }).catch(err => {
      console.log(`Error occurred trying to find team. (${team})`)
    });
  }).catch(err => {
    console.log('Could not access database.');
  });
});