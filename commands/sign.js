const config = require('../config.json');
const sqlite = require('sqlite');

exports.run = ((client, message, args) => {
  const player = args.join(' ');
  const format = ``;

  if (!args.length) {
    return message.channel.send('Choose a player to sign to your team.');
  }

  const check_manager = (player => {
    sqlite.open(config.db).then(() => {
      // sqlite.get(`SELECT * FROM teams WHERE manager=\"\"`)
    });
  });

  sqlite.open(config.db).then(() => {
    sqlite.get(`SELECT * FROM teams WHERE manager_id=\"${message.author.id}\"`).then(row => {
      if (!row) {
        // not a manager
        return message.reply('you are not a manager of a team!');
      } else {
        // a real manager
        sqlite.get(`SELECT * FROM players WHERE name=\"${player}\"`).then(player_row => {
          if (!player_row) {
            return message.channel.send(`\`${player}\` is not a registered player in PL and is unable to be signed.\n\nThat player must use the command \`v!register [PB2 account name]\` and then you will be able to sign them.`);
          }

          console.log('player is registerd in pl');
          let players = /^\[.*\]$/.test(row.players) ? JSON.parse(row.players) : [];
          players.push(player);

          console.log(JSON.stringify(players));
  
          sqlite.run(`UPDATE teams SET players=\'${JSON.stringify(players)}\' WHERE manager_id=\"${message.author.id}\"`).then(() => {
            sqlite.run(`UPDATE players SET team=\"${row.team_name}\" WHERE name=\"${player}\"`).then(() => {
              console.log(`${player} successfully signed by ${row.team_name}`);
              message.channel.send(`\`${player}\` has successfully been signed to Team ${row.team_name}.`);
            }).catch(err => {
              console.log('error in teams update');
            });
          }).catch(err => {
            console.log('error in players update');
          });
        }).catch(err => {
          console.log('error in players select');
        });
      }
    });
  }).catch(err => {
    console.log('Failed to open database.');
  })
});