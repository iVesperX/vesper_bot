const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);
const data = db.getData('/');

const clone = (o => JSON.parse(JSON.stringify(o)));

exports.initialize = {
  teams: (() => {
    let players = clone(db.getData('/players'));
    
    db.push('/teams', [
      { name: 'Template', manager: '', manager_id: -1, players: [] }
    ]);

    players.map(p => p.team = '-');
    db.push('/players', players);

    console.log('Initialized new JSON database.')
  }),

  all: ((client) => {
    const servID = '310995545588105217';
    const serv = client.guilds.get(servID);

    let invitation = data.pl_invite;

    db.push('/init', true);
    
    if (serv && !invitation) {
      db.push('/pl_invite', '');

      let channel = serv.channels.get('422149991482785812');
      channel.createInvite({ maxAge: 0, unique: true }, 'PL Permanent Invitation Link').then(invite => {
        db.push('/pl_invite', `https://discordapp.com/invite/${invite.code}`);
        console.log(`Successfully generated invitation link for #${channel.name} in ${serv.name}`)
      }).catch(err => {
        console.log(`Failed to generate invitation link for #${channel.name}`);
      });
    }

    db.push('/teams', [
      { name: 'Template', manager: '', manager_id: -1, players: [] }
    ]);
    db.push('/players', [
      { name: 'Template', matches_left: 10, team: '-', discord_id: -1, waived_from: '-', is_manager: false, is_former_manager: false }
    ]);    
    db.push('/verified/0', ['N/A']);
  
    console.log('Initialized new JSON database.')
  })
}