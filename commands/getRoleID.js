const config = require('../storage/config.json');

exports.run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;

  if (!args.length) return message.channel.send('Specify a role name in this server.');

  const role_name = args.join(' '),
        server = message.guild,
        actual_role = server.roles.find('name', role_name);

  if (!actual_role) return message.channel.send(`\`${role_name}\` does not exist in ${server.name}. Role name is case-sensitive.`);

  message.channel.send(`The ID for the role \`${role_name}\` is ${actual_role.id}.`);
});