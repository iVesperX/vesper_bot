const config = require('../storage/config.json');

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

exports.run = (async (client, message, args) => {
  const team = args.join(' ');
  const format =  `\`${config.prefix}removeteam {name}\``;

  if (!config.accessIDS.includes(message.author.id)) return;

  if (!args.length) {
    return message.channel.send('Choose a team to remove.')
  }

  // where the magic happens
  const teams = (await client.database.collection('teams').findOne({})).data;
  const players = (await client.database.collection('players').findOne({})).data;

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

  // pushes to mongo
  client.database.collection('teams').updateOne({}, { $set: { 'data': teams } });
  client.database.collection('players').updateOne({}, { $set: { 'data': players } });

  message.channel.send(`${real_team_name} has been successfully removed from PL.`);
});