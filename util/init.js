// import { pl_server } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');


// mLab collections
const collections = {
  init: true,
  pl_invite: [],

  teams: [
    { name: 'Template', manager: '', manager_id: -1, players: [] }
  ],

  players: [
    { name: 'Template', matches_left: 10, team: '-', discord_id: -1, waived_from: '-', is_manager: false, is_former_manager: false }
  ],

  verified: {
    0: 'N/A'
  }
};

export const initialize = {
  invite: (async (client) => {
    const servID = config.pl_server.serverID;
    const serv = client.guilds.fetch(servID);
    const invite = (await client.database.collection('pl_invite').findOne({})).data;
  
    let validInvite;
    
    try { validInvite = await client.fetchInvite(invite) } catch (err) {}
    
    if (serv && !validInvite) {
      console.log('Generating new invite link...')
  
      const channel = serv.channels.first(); // deprecated: serv.defaultChannel;
  
      channel.createInvite({ maxAge: 0, unique: true }, 'PL Permanent Invitation Link').then(invite => {
        const inviteURL = `https://discordapp.com/invite/${invite.code}`;
        
        client.database.collection('pl_invite').updateOne({}, { $set: { 'data': inviteURL } });
  
        console.log(`Successfully generated invitation link for #${channel.name} in ${serv.name}`)
      }).catch(err => {
        console.log(`Failed to generate invitation link for #${channel.name}.\n${err}`);
      });
    } else {
      console.log(`${validInvite.url} is a valid invitation link.`);
    }
  }),

  teams: (async (client) => {
    const players = (await client.database.collection('players').findOne({})).data;

    players.map(p => p.team = '-');

    client.database.collection('teams').updateOne({}, { $set: { 'data': collections.teams } });
    client.database.collection('players').updateOne({}, { $set: { 'data': players } });

    console.log('Successfully reset teams.')
  }),

  all: (async (client, reset) => {
    // generates a new collection
	  const generateCollection = (async (name) => {
		  if (!collections[name]) return;
		
		  await client.database.createCollection(name);
      await client.database.collection(name).insertOne({ 'data': collections[name] });
    
      console.log(`Initialized new MongoDB database. [${name}]`);
	  });
	
	  // Iterates through collections
	  for (let i in collections) {
		  const c = await client.database.collection(i).findOne({});
		  const exists = c && true;

		  if (reset === true) {
        console.log('Resetting all collections...');
			  try { await client.database.dropCollection(i) } catch (e) {}

        generateCollection(i);
		  } else {
        if (!exists) generateCollection(i);
      }
    }
  })
}