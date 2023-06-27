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
    const invite = (await client.database.collection('pl_invite').findOne({})).data;
  
    let validInvite;
    let serv;
    
    try { validInvite = await client.fetchInvite(invite) } catch (err) {}
    try { serv = await client.guilds.fetch(servID) } catch (err) {}
    
    if (serv && !validInvite) {
      const verificationChannel = await serv.channels.fetch(config.pl_server.verification);

      /* requires MANAGE_SERVER permission flag

      const verificationInvite = (await verificationChannel.fetchInvites()).first();

      if (verificationInvite) {
        console.log(`Leveraging existing verification invite: https://discordapp.com/invite/${verificationInvite.code}`)
        return;
      }
      */

      console.log('Generating new invite link...');
  
      verificationChannel.createInvite({ maxAge: 0, unique: true }, 'PL Permanent Invitation Link').then(invite => {
        const inviteURL = `https://discordapp.com/invite/${invite.code}`;
        
        client.database.collection('pl_invite').updateOne({}, { $set: { 'data': inviteURL } });
  
        console.log(`Successfully generated invitation link for #${verificationChannel.name} in ${serv.name}`)
      }).catch(err => {
        console.log(`Failed to generate invitation link for #${verificationChannel.name}.\n${err}`);
      });
    } else if (!serv) {
      console.log(`${client.user.username} is not in PL server. Unable to generate valid invite link.`)
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