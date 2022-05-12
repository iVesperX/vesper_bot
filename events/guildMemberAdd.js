// import { pl_server, bot_server, date_options } from '../storage/config.json';
import { joined, verify } from '../util/verification.js';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

const devs = [
  '191333046786588672' // Vesper
];

const servers = [
  '328650645793931267', // PB2 Official
  '310995545588105217', // PL Server
  '439256178237898754', // Vesper Server
  '372490159649718274'  // Art Editors
];

export const run = (async (client, member) => {
  if (!servers.includes(member.guild.id)) return;
  // if (devs.includes(member.user.id)) return;

  const today = new Date();
  const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
  const join_message = `<@${member.user.id}> has joined \`${member.guild.name}\` (on ${formatted_date})`;

  if (config.bot_server) {
    client.guilds.fetch(config.bot_server.id).channels.fetch(config.bot_server.mod.servers).send(join_message);
  }

  // PL Server
  if (member.guild.id == servers[1]) {
    const users = (await client.database.collection('verified').findOne({})).data;

    const verified_account = users[member.user.id] ? users[member.user.id][0] : null;
        
    if (!verified_account) {
      joined(client, member.user);
      return;
    } else {
      setTimeout(() => {
        verify(client, member.user, verified_account);

        const account_verified = member.guild.roles.fetch(config.pl_server.roles.verifiedID);

        member.guild.channels.fetch('422149991482785812').send(`<@${member.user.id}> has joined and been given the <@&${account_verified.id}> role.`);
        member.user.send(`Since you are already registered as ${verified_account}, you have been given the Account Verified role in ${member.guild.name}!`);  
      }, 1500);
    }
  }
});