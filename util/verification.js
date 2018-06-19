exports.verify = ((client, user, name) => {
  exports.setRoles(client, user, name, false);
});

exports.register = ((client, user, name) => {
  exports.setRoles(client, user, name, true);
});

exports.setRoles = ((client, user, name, registration) => {
  const pl_server = client.guilds.get('310995545588105217');

  if (!pl_server) return console.log('I am not in Plazma League server for some reason...');

  const client_in_PL = pl_server.members.get(client.user.id);
  const registered_ID = '417462892087214081';
  const verified_ID = '421819247988310026';
  const spectators_ID = '319613891208282112';
  
  const discord_tag = user.tag;

  const pl_server_member = pl_server.members.get(user.id);

  const role_to_add = !registration ? verified_ID : registered_ID;
  const role_to_remove = !registration ? spectators_ID : null;
  const reason = !registration ? 'Account Verification' : 'PL Registration';
  

  if (!client_in_PL || !pl_server_member) return console.log('Someone\'s not in PL server!');
  if (!client_in_PL.hasPermission(["MANAGE_NICKNAMES", "MANAGE_ROLES"])) return console.log('Insufficient permissions in Plazma League Server.');

  if (!pl_server_member) return console.log(`${discord_tag} registered, but not in Plazma League server.`);

  pl_server_member.setNickname(name, reason).catch(err => {
    console.log(`Unable to set nickname ${name} to ${discord_tag}`);
  });

  pl_server_member.addRole(role_to_add).catch(err => {
    const actual_role = pl_server.roles.get(role_to_add);
    console.log(`Unable to add "${actual_role.name}" role to ${discord_tag}`);
  });

  pl_server_member.removeRole(role_to_remove).catch(err => {
    const actual_role = pl_server.roles.get(role_to_remove);
    console.log(`Unable to remove "${actual_role}" role from ${discord_tag}`)
  });
});