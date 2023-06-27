// import { ownerID } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

export const run = (async (client, message, args) => {
  if (message.author.id != config.ownerID) return;
  
  const init = (await client.database.collection('init').findOne({})).data;
  const pl_invite = (await client.database.collection('pl_invite').findOne({})).data;
  const teams = (await client.database.collection('teams').findOne({})).data;
  const players = (await client.database.collection('players').findOne({})).data;
  const users = (await client.database.collection('verified').findOne({})).data;

  const data = {
    'init': init,
    'pl_invite': pl_invite,
    'teams': teams,
    'players': players,
    'verified': users
  };

  const backup_exists = await client.database.listCollections({ name: 'backup' }).hasNext();
  if (!backup_exists) {
    await client.database.createCollection('backup');
    await client.database.collection('backup').insertOne({ 'data': data })
    console.log('Backup database created.');
  } else {
    await client.database.collection('backup').updateOne({}, { $set: { 'data': data } });
  }

  message.channel.send('Database successfully backed up.');
});