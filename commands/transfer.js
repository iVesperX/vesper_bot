// import { ownerID } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

import JsonDB from 'node-json-db';
const db = new JsonDB('data', true);

export const run = (async (client, message, args) => {
  if (message.author.id != config.ownerID) return;
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