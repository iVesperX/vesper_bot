const config = require('../storage/config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true);

exports.run = (async (client, message, args) => {
  db.reload();
  const data = db.getData('/');
  const teams = data.teams;
  const players = data.players;
  const users = data.verified;

  await client.database.collection('teams').updateOne({}, { $set: { 'data': teams } });
  await client.database.collection('players').updateOne({}, { $set: { 'data': players } });
  await client.database.collection('verified').updateOne({}, { $set: { 'data': users } });

  message.channel.send('Datbase updated.');
});