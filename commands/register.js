import { register } from '../util/verification.js';
// import { prefix, db_placeholder, bot_server, date_options } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

const CODE = '```';
const type = 'fix';

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());
const clone = (o => JSON.parse(JSON.stringify(o)));

export const run = (async (client, message, args) => {
  const account = args.join(' ');
  const discord_tag = message.author.username;
  const format =  `\`${config.prefix}register {account_name}\``;
  
  const pl_server_member = client.guilds.fetch('310995545588105217').members.fetch(message.author.id);
  const inv = (await client.database.collection('pl_invite').findOne({})).data;

  if (!pl_server_member) return message.reply(`You are currently not in Plazma League Discord! You may only register if you are verified in the chat. PL Discord chat is public and open to everyone.\n\nInvitation link: ${inv ? inv : '-'}`)

  if (!args.length) {
    return message.channel.send('Specify a PB2 account to register for PL.\n\n__Example__: ' + format);
  }

  const add_roles = (() => register(client, message.author, account));

  // where the magic happens
  const players = (await client.database.collection('players').findOne({})).data;
  const users = (await client.database.collection('verified').findOne({})).data;

  if (!users[message.author.id]) return message.reply(`you have not verified yourself as any account!\n\nUse \`${config.prefix}verify {pb2_account}\` to verify an account to register with.`);

  const registered_account_index = players.findIndex(p => {
    return user = users[message.author.id].some(u => equals(p.name, u));
  });

  const other_registered_account_index = players.findIndex(p => equals(p.name, account));
  const verified_account = users[message.author.id].find(u => equals(u, account));

  if (players[registered_account_index]) {
    // already in database
    console.log(`${message.author.username} attempted to register as ${account}, but already registered as ${players[registered_account_index].name}.`);
    return message.reply(`you are already registered as ${players[registered_account_index].name}! You may not register as another account.`);
  }

  if (players[other_registered_account_index] && !equals(config.db_placeholder, account)) {
    console.log(`${message.author.username} attempted to register as ${players[other_registered_account_index].name}'s account.`);
    return message.channel.send(`Another user is already registered as \`${players[other_registered_account_index].name}\`. You may not register as that account.`);
  }

  if (!verified_account || equals(config.db_placeholder, account)) return message.channel.send(`You are not verified as \`${account}\`. You must either do \`${config.prefix}verify ${account}\` or register from one of the following accounts:\n\n${CODE + type}\n${users[message.author.id].join('\n') + CODE}`);

  message.channel.send(`Are you sure you want to register as ${verified_account}? React with :white_check_mark: to confirm your registration.\n\n*Expires in 10 seconds...*`).then(new_message => {
    new_message.react('✅').then(() => {
      const filter = ((reaction, user) => reaction.emoji.name === '✅' && message.author.id === user.id);
      new_message.awaitReactions(filter, { max: 1, time: 10000 }).then(collected => {
        if (!collected.size) {
          new_message.edit(`${question}Query expired.`);
          return new_message.clearReactions();
        }
        
        // existent account, owned
        let new_player = clone(players[0]);
        new_player.name = verified_account;
        new_player.discord_id = message.author.id;
        
        // actually pushes player
        players.push(new_player);
        
        // actually updates document
        client.database.collection('players').updateOne({}, { $set: { 'data': players } });

        add_roles();

        if (config.bot_server) {
          const today = new Date();
          const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
          const reg_message = `${message.author.username} (<@${message.author.id}>) has registered as \`${account}\` (on ${formatted_date})`;

          client.channels.fetch(config.bot_server.mod.pl_registration).then(channel => {
            channel.send(reg_message);
          });
        }

        message.reply(`you\'ve been successfully registered as \`${account}\`!`);
      });

    }).catch(err => {
      message.channel.send('An error occurred. Try again another time.');
    });

  });
});