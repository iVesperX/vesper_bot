const request = require('request');
const config = require('../storage/config.json');
const verification = require('../util/verification.js');

const pb2_api = 'http://plazmaburst2.com/extract.php?login=';

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

exports.run = (async (client, message, args) => {
  const player = args.join(' ');
  const discord_tag = message.author.tag;
  const format =  `\`${config.prefix}verify {pb2_name}\``;

  if (!args.length) {
    return message.channel.send('Specify a PB2 account to verify yourself as. __Example__: ' + format);
  }

  const add_roles = (() => verification.verify(client, message.author, player));

  const invalid_account = (() => {
    message.channel.send(`The account \`${player}\` is not a valid PB2 account. It may have been disabled or simply does not exist. Try verifying with another account.`)
  });
  
  // where the magic happens
  const users = (await client.database.collection('verified').findOne({})).data;

  const verified_account = users[message.author.id]
    ? users[message.author.id].find(u => equals(u, player))
    : null;
  
  if (verified_account) {
    console.log(`${message.author.tag} attempted to verify as ${verified_account}, but already verified.`);
    add_roles();
    message.reply(`you are already verified as ${verified_account}.`);
  } else {
    if (player.length < 3) return invalid_account();

    // not already in database
    request.get(pb2_api + player, function(err, res, body) {
      if (err) return console.log(err);
      if (!res || res.statusCode != 200) return console.log('Invalid status/status code.');
      const account = JSON.parse(body);
      const discord_field = account.icq;

      if (account.Error) {
        // non-existent account
        return invalid_account();
      } else if (discord_field != discord_tag) {
        // existent account, not owned
        return message.channel.send(`Set your PB2 account\'s Discord profile field to \`${discord_tag}\` to verify yourself as that account.`);
      } else if (discord_field == discord_tag) {
        // existent account, owned
        let new_user_list = users[message.author.id] ? users[message.author.id].slice(0) : [];
        new_user_list.push(account.login);

        users[message.author.id] = new_user_list;        

        // actually updates document
        client.database.collection('verified').updateOne({}, { $set: { 'data': users } });

        add_roles();

        if (config.bot_server) {
          const today = new Date();
          const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
          const ver_message = `${message.author.tag} (<@${message.author.id}>) has verified as \`${account.login}\` (on ${formatted_date})`;

          client.guilds.get(config.bot_server.id).channels.get(config.bot_server.mod.pl_verification).send(ver_message);
        }

        message.reply(`you\'ve been successfully verified as \`${account.login}\`!`);
      }
    });
  }
});