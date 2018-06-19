const config = require('../config.json');
const verification = require('../util/verification.js');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const devs = [
  '191333046786588672' // Vesper
];

const servers = [
  '328650645793931267', // PB2 Official
  '310995545588105217', // PL Server
  '362729317077221377', // Vesper Server
  '372490159649718274'  // Art Editors
];

exports.run = ((client, member) => {
  if (!servers.includes(member.guild.id)) return;
  // if (devs.includes(member.user.id)) return;

  const today = new Date();
  const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
  const join_message = `<@${member.user.id}> has joined \`${member.guild.name}\` (on ${formatted_date})`;

  if (config.bot_server) {
    client.guilds.get(config.bot_server.id).channels.get(config.bot_server.mod.servers).send(join_message);
  }

  // PL Server
  if (member.guild.id == servers[1]) {
    const verified_account = users[message.author.id] ? users[message.author.id][0] : null;
    
    if (!verified_account) return;

    const add_roles = (() => verification.verify(client, member.user, verified_account));
    const account_verified = member.guild.roles.find('name', 'Account Verified');

    member.guild.channels.get('422149991482785812').send(`<@${member.user.id}> has joined and been given the <@&${account_verified.id}> role.`);
    member.user.send(`Since you are already registered as ${verified_account}, you have been given the Account Verified role in ${member.guild.name}!`);  
  }
});