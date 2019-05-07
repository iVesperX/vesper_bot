const config = require('../storage/config.json');

exports.joined = ((client, user) => {
  exports.setRoles(client, user, null, false);
});

exports.verify = ((client, user, name) => {
  exports.setRoles(client, user, name, false);
});

exports.register = ((client, user, name) => {
  exports.setRoles(client, user, name, true);
});

exports.setRoles = ((client, user, name, registration) => {
  const pl_server = client.guilds.get(config.pl_server.serverID);

  if (!pl_server) return console.log('I am not in Plazma League server for some reason...');

  const client_in_PL = pl_server.me;
  const registered_ID = config.pl_server.roles.registeredID;
  const verified_ID = config.pl_server.roles.verifiedID;
  const spectators_ID = config.pl_server.roles.spectatorsID;
  
  const discord_tag = user.tag;

  pl_server.fetchMember(user.id).then(member => {
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
      const actual_role = pl_server.roles.get(role_to_add);
      console.log(`Unable to add "${actual_role && actual_role.name}" role to ${discord_tag}`);
    });

    if (name) {
      pl_server_member.setNickname(name, reason).catch(err => {
        console.log(`Unable to set nickname ${name} to ${discord_tag}`);
      });
    }

    if (registration) return; // returns if registering
  
    pl_server_member.removeRole(role_to_remove).catch(err => {
      const actual_role = pl_server.roles.get(role_to_remove);
      console.log(`Unable to remove "${actual_role && actual_role.name}" role from ${discord_tag}`)
    });

  }).catch(err => {
    console.log(`Error fetching user: ${user.tag} (${user.id})`);
  });
});