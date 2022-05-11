// import { prefix } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

export const run = ((client, message, args) => {
  const player_to_sign = args.join(' ');
  const format = `${config.prefix}sign {player}`;

  if (!args.length) {
    return message.channel.send('Choose a player to sign to your team.');
  }

  const teams = (await client.database.collection('teams').findOne({})).data;
  const players = (await client.database.collection('players').findOne({})).data;

  const team_index = teams.findIndex(t => t.manager_id == message.author.id);
  const player_index = players.findIndex(p => equals(p.name, player_to_sign));

  if (!teams[team_index]) return message.reply('you are not a manager of a team!');
  if (!players[player_index] || equals(player_to_sign, 'template')) return message.channel.send(`\`${player_to_sign}\` is not a registered player in PL and is unable to be signed.\n\nThat player must use the command \`v!register [PB2 account name]\` and then you will be able to sign them.`);
  if (players[player_index].team != '-') {
    if (players[player_index].is_manager) return message.channel.send(`\`${players[player_index].name}\` is the manager of ${players[player_index].team}. That player is bound to that team for the rest of the season.`);
    return message.channel.send(`\`${players[player_index].name}\` is already on ${players[player_index].team}. That player must be waived in order for you to sign them.`);
  }
  
  if (players[player_index].is_former_manager) return message.channel.send(`\`${players[player_index].name}\` is a **former manager**. Former managers are unable to be signed by other teams.`);

  teams[team_index].players.push(players[player_index].name);
  players[player_index].team = teams[team_index].name;

  // pushes to mongo
  client.database.collection('teams').updateOne({}, { $set: { 'data': teams } });
  client.database.collection('players').updateOne({}, { $set: { 'data': players } });

  console.log(`${players[player_index].name} successfully signed by ${teams[team_index].name}`);
  message.channel.send(`\`${players[player_index].name}\` has successfully been signed to Team ${teams[team_index].name}.`);
});