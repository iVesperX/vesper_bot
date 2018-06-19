const request = require('request');
const config = require('../config.json');
const verification = require('../util/verification.js');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const CODE = '```';

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

exports.run = ((client, message, args) => {
  const account = args.join(' ');
  const discord_tag = message.author.tag;
  const format =  `\`${config.prefix}register {account_name}\``;
  
  const pl_server_member = client.guilds.get('310995545588105217').members.get(message.author.id);

  if (!pl_server_member) return message.reply(`You are currently not in Plazma League Discord! You may only register if you are verified in the chat. PL Discord chat is public and open to everyone.\n\nInvitation link: ${data.pl_invite ? data.pl_invite : '-'}`)

  if (!args.length) {
    return message.channel.send('Specify a PB2 account to register for PL.\n\n__Example__: ' + format);
  }

  const add_roles = (() => verification.register(client, message.author, account));
  
  db.reload();
  const players = db.getData('/players');
  const users = db.getData('/verified');

  // where the magic happens
  if (!users[message.author.id]) return message.reply(`you have not verified yourself as any account!\n\nUse \`${config.prefix}verify {pb2_account}\` to verify an account to register with.`);

  const registered_account_index = players.findIndex(p => {
    return user = users[message.author.id].some(u => equals(p.name, u));
  });

  const other_registered_account_index = players.findIndex(p => equals(p.name, account));
  const verified_account = users[message.author.id].find(u => equals(u, account));

  if (players[registered_account_index]) {
    // already in database
    console.log(`${message.author.tag} attempted to register as ${account}, but already registered as ${players[registered_account_index].name}.`);
    return message.reply(`you are already registered as ${players[registered_account_index].name}! You may not register as another account.`);
  }

  if (players[other_registered_account_index] && !equals(config.db_placeholder, account)) {
    console.log(`${message.author.tag} attempted to register as ${players[other_registered_account_index].name}'s account.`);
    return message.channel.send(`Another user is already registered as \`${players[other_registered_account_index].name}\`. You may not register as that account.`);
  }

  if (!verified_account || equals(config.db_placeholder, account)) return message.channel.send(`You are not verified as \`${account}\`. You must either do \`${config.prefix}verify ${account}\` or register from one of the following accounts:\n\n${CODE}css\n${users[message.author.id].join('\n') + CODE}`);

  // existent account, owned
  let new_player = clone(players[0]);
  new_player.name = account;
  new_player.discord_id = message.author.id;
  
  // actually pushes player
  players.push(new_player);
  db.push('/players', players);
  db.reload();
  add_roles();

  message.reply(`you\'ve been successfully registered as \`${account}\`!`);
});