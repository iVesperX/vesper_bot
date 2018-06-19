const config = require('../config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

exports.run = ((client, message, args) => {
  const manager_flag = '-m';
  const manager_modifier = args.indexOf(manager_flag);
  const format =  `\`${config.prefix}addteam {name} ${manager_flag} {manager}\``;

  if (!config.accessIDs.includes(message.author.id)) return;

  if (!args.length) {
    return message.channel.send('Specify a new team to add.');
  }

  if (manager_modifier == 0 || !args[manager_modifier] || !args[manager_modifier + 1]) {
    return message.channel.send(`The correct format is ${format}`);
  }

  db.reload();
  const data = db.getData('/');
  const teams = data.teams;
  const players = data.players;

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

  const team_exists = teams.find(t => equals(t.name, team));
  const manager_has_team = teams.find(t => equals(t.manager, manager));
  // const manager_exists = players.find(p => equals(p.name, manager));
  const manager_index = players.findIndex(p => equals(p.name, manager));

  if (team_exists) return message.channel.send(`${team_exists.name} is already a registered PL team. The manager is ${team_exists.manager}.`);
  if (manager_has_team) return message.channel.send(`${team_exists.manager} already owns a registered PL team. The team is ${team_exists.name}.`);
  if (!players[manager_index]) return message.channel.send(`${manager} is not a registered PL player under the name specified.`);
  
  let new_team = clone(teams[0]);

  new_team.name = team;
  new_team.manager = players[manager_index].name;
  new_team.manager_id = players[manager_index].discord_id;
  new_team.players.push(players[manager_index].name);

  // pushes to teams object
  teams.push(new_team);
  db.push('/teams', teams);

  players[manager_index].team = team;
  players[manager_index].is_manager = true;
  db.push('/players', players);

  message.channel.send(`Team ${team} is registered with ${players[manager_index].name} as their manager.`);
});