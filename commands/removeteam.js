const config = require('../config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

exports.run = ((client, message, args) => {
  const team = args.join(' ');
  const format =  `\`${config.prefix}removeteam {name}\``;

  if (!config.accessIDS.includes(message.author.id)) return;

  if (!args.length) {
    return message.channel.send('Choose a team to remove.')
  }

  db.reload();
  const data = db.getData('/');
  const teams = data.teams;
  const players = data.players;

  const team_index = teams.findIndex(t => equals(t.name, team));

  if (!teams[team_index] || equals(team, 'template')) return message.channel.send(`Team ${team} does not exist.`);

  let real_team_name = teams[team_index].name;
  teams.splice(team_index, 1);

  players.map(p => {
    if (equals(p.team, team)) {
      p.team = '-';
      if (p.is_manager == true) {
        p.is_manager = false;
        p.is_former_manager = true;
      }
    }
    
    return p;
  });

  db.push('/teams', teams);
  db.push('/players', players);

  message.channel.send(`${real_team_name} has been successfully removed from PL.`);
});