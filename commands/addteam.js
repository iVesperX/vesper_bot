// const reactor = require('../util/reactor.js');
const config = require('../config.json');
const sqlite = require('sqlite');

exports.run = ((client, message, args) => {
  const manager_flag = '-m';
  const manager_modifier = args.indexOf(manager_flag);
  const format =  `\`${config.prefix}addteam {name} ${manager_flag} {manager}\``;

  // if (message.author.id != config.ownerID) return;

  if (!args.length) {
    return message.channel.send('Specify a new team to add.');
  }

  if (manager_modifier == 0 || !args[manager_modifier] || !args[manager_modifier + 1]) {
    return message.channel.send(`The correct format is ${format}`);
  }

  let team = [];
  let manager = [];

  for (let i = 0; i < args.length; i++) {
    switch (true) {
      case i < manager_modifier:
        team.push(args[i]); break;

      case i > manager_modifier:
        manager.push(args[i]); break;
    }
  }

  team = team.join(' ');
  manager = manager.join(' ');

  sqlite.open(`./${config.db}`).then(() => {
    // id, team_name, manager, manager_id, player
    sqlite.get(`SELECT * FROM teams WHERE team_name=\"${team}\" OR manager=\"${manager}\"`).then(row => {
      // if (err) return console.log(err);

      if (row) {
        if (row.team_name == team) {
          message.channel.send(`${team} is already a registered PL team. The manager is ${row.manager}.`);
        } else if (row.manager == manager) {
          message.channel.send(`${manager} already owns a registered PL team. The team is ${row.team_name}.`);
        }
      } else {
        sqlite.get(`SELECT * FROM players WHERE name=\"${manager}\"`).then(row => {
          if (!row) {
            message.channel.send(`${manager} is not a registered PL player under the name specified.`);
          } else {
            sqlite.run(`INSERT INTO teams (team_name, manager, manager_id, players) VALUES ($team, $manager, $manager_id, "")`, {
              $team: team,
              $manager: manager,
              $manager_id: row.discord_id
            }).then(() => {
              sqlite.run(`UPDATE players SET team=\"${team}\" WHERE name=\"${manager}\"`).catch(err => {
                console.log(err);
              });
              console.log(`[${team}] Inserted team.`);
              message.channel.send(`Team ${team} is registered with ${manager} as their manager.`);
            }).catch(err => {
              console.log(`[${team}] Failed to insert.`);
            });
          }
        });
      }
    });
  }).catch(err => {
    console.log(err);
  });
});