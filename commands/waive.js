// Incomplete
const config = require('../config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

exports.run = ((client, message, args) => {
  const player_to_waive = args.join(' ');
  const format = `${config.prefix}waive {player}`;

  if (!args.length) {
    return message.channel.send('Choose a player to waive from your team.');
  }  

  db.reload();
  const data = db.getData('/');
  const teams = data.teams;
  const players = data.players;

  const team_index = teams.findIndex(t => t.manager_id == message.author.id);
  const player_index = players.findIndex(p => equals(p.name, player_to_waive));
  
  if (!teams[team_index]) return message.reply('you are not a manager of a team!');

  const team_players = teams[team_index].players;
  const player_on_team_index = team_players.findIndex(p => equals(p, player_to_waive));
  const player_on_team = team_players[player_on_team_index]

  if (!players[player_index]) return message.channel.send(`\`${args}\` is not a player on ${teams[team_index].name}.`);

  if (!player_on_team) {
    const main_message = `${players[player_index].name} is not a player on ${teams[team_index].name}.`;
    const other_team = teams.find(t => t.name == players[player_index].team);

    if (players[player_index].team == '-') return message.channel.send(`${players[player_index].name} is not a player on ${teams[team_index].name}.`);
    if (other_team) {
      console.log(other_team.manager);
      console.log(player_to_waive);
      const reason = !equals(other_team.manager, player_to_waive) ? `Only ${other_team.manager} can waive them.` : `That player owns ${other_team.name} and can not be waived.`;
      return message.channel.send(main_message + '\n\n' + reason);
    }
  }

  // team_players.splice(player_on_team_index, 1);
  // players[player_index].team = '-';

  // db.push('/teams', teams);
  // db.push('/players', players);

  message.channel.send(`${player_on_team} has been successfully waived from ${teams[team_index].name}.`);
});