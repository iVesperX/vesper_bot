// import { pl_server } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

export const joined = ((client, user) => {
  setRoles(client, user, null, false);
});

export const verify = ((client, user, name) => {
  setRoles(client, user, name, false);
});

export const register = ((client, user, name) => {
  setRoles(client, user, name, true);
});

export const setRoles = (async (client, user, name, registration) => {
  const pl_guild = await client.guilds.fetch(config.pl_server.serverID);

  if (!pl_guild) return console.log('I am not in Plazma League server for some reason...');

  const client_in_PL = pl_guild.me;
  const registered_ID = config.pl_server.roles.registeredID;
  const verified_ID = config.pl_server.roles.verifiedID;
  const spectators_ID = config.pl_server.roles.spectatorsID;
  
  const discord_tag = user.tag;

  pl_guild.members.fetch(user.id).then(member => {
    // fetches user
    const pl_server_member = member;

    const role_to_add = !registration ? (!name ? spectators_ID : verified_ID) : registered_ID;
    const role_to_remove = !registration ? spectators_ID : null;
    const reason = !registration ? (!name ? 'Server Join' : 'Account Verification') : 'PL Registration';
    
    if (!pl_server_member) return console.log(discord_tag + ' isn\'t in PL server!');
    if (!client_in_PL.hasPermission(["MANAGE_NICKNAMES", "MANAGE_ROLES"])) return console.log('Insufficient permissions in Plazma League Server.');
  
    if (!pl_server_member) return console.log(`${discord_tag} registered, but not in Plazma League server.`);
  
    // performs actions
    pl_server_member.addRole(role_to_add).catch(err => {
      const actual_role = pl_guild.roles.get(role_to_add);
      console.log(`Unable to add "${actual_role && actual_role.name}" role to ${discord_tag}`);
    });

    if (name) {
      if (user.username == name) {
        // handle logic for pb2 account == username
        name = `${name}*`
      }
      
      pl_server_member.setNickname(name, reason).catch(err => {
        console.log(`Unable to set nickname ${name} to ${discord_tag}`);
      });
    }

    if (registration) return; // returns if registering
  
    pl_server_member.removeRole(role_to_remove).catch(err => {
      const actual_role = pl_guild.roles.get(role_to_remove);
      console.log(`Unable to remove "${actual_role && actual_role.name}" role from ${discord_tag}`)
    });

  }).catch(err => {
    console.log(`Error fetching user: ${user.tag} (${user.id})`);
  });
});
