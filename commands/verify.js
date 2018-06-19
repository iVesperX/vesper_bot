const request = require('request');
const config = require('../config.json');
const verification = require('../util/verification.js');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const pb2_api = 'http://plazmaburst2.com/extract.php?login=';

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

exports.run = ((client, message, args) => {
  const player = args.join(' ');
  const discord_tag = message.author.tag;
  const format =  `\`${config.prefix}verify {pb2_name}\``;

  if (!args.length) {
    return message.channel.send('Specify a PB2 account to verify yourself as. __Example__: ' + format);
  }

  const add_roles = (() => verification.verify(client, message.author, player));
  
  db.reload();
  const users = db.getData('/verified');

  // where the magic happens
  const verified_account = users[message.author.id]
    ? users[message.author.id].find(u => equals(u, player))
    : null;

  if (verified_account) {
    console.log(`${message.author.tag} attempted to verify as ${verified_account}, but already verified.`);
    add_roles();
    message.reply(`you are already verified as ${verified_account}.`);
  } else {
    // not already in database
    request.get(pb2_api + player, function(err, res, body) {
      if (err) return console.log(err);
      if (!res || res.statusCode != 200) return console.log('Invalid status/status code.');
      const account = JSON.parse(body);
      const discord_field = account.icq;

      if (account.Error) {
        // non-existent account
        return message.channel.send(`The account \`${player}\` is not a valid PB2 account. It may have been disabled or simply does not exist. Try verifying with another account.`);
      } else if (discord_field != discord_tag) {
        // existent account, not owned
        return message.channel.send(`Set your PB2 account\'s Discord profile field to \`${discord_tag}\` to verify yourself as that account.`);
      } else if (discord_field == discord_tag) {
        // existent account, owned
        let new_user_list = users[message.author.id] ? users[message.author.id].slice(0) : [];
        new_user_list.push(account.login);

        users[message.author.id] = new_user_list;        

        db.push('/verified', users);
        db.reload();
        add_roles();

        message.reply(`you\'ve been successfully verified as \`${account.login}\`!`);
      }
    });
  }
});