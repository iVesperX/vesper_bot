const sqlite = require('sqlite');
const request = require('request');

const config = require('../config.json');

const pb2_api = 'http://plazmaburst2.com/extract.php?login=';

const equals = ((value1, value2) => value1.toLowerCase() == value2.toLowerCase());

exports.run = ((client, message, args) => {
  const player = args.join(' ');
  const format =  `\`${config.prefix}register {pb2_name}\``;

  const add_verified_role = (() => {
    const pl_server_member = client.guilds.get('310995545588105217').members.get(message.author.id);

    if (pl_server_member) {
      pl_server_member.setNickname(player, 'PL Registration').then(() => {
        pl_server_member.addRole('421819247988310026').then(() => {
          pl_server_member.removeRole('319613891208282112').catch(err => {
            console.log(err);
            console.log(`Unable to remove Spectators role from ${message.author.tag}`)
          });
        }).catch(err => {
          console.log(`Unable to add Account Verified role to ${message.author.tag}`)
        }).catch(err => {
          console.log(`Unable to set nickname ${player} to ${message.author.tag}`);
        });
      });
    } else {
      console.log(`${message.author.tag} registered, but not in Plazma League server.`)
    }
  });

  if (!args.length) {
    return message.channel.send('Specify a PB2 account to sign up with. __Example__: ' + format);
  }

  sqlite.open(`./${config.db}`).then(() => {
    sqlite.get(`SELECT * FROM players where discord_id=\"${message.author.id}\"`).then(row => {
      if (row && equals(row.name, player)) {        
        // already in database
        add_verified_role();
        message.reply(`you are already registered under that account!`);
      } else if (row && !equals(row.name, player)) {
        // register under new account?
      } else {
        // not already in database
        request.get(pb2_api + player, function(err, res, body) {
          if (err) return console.log(err);
      
          if (res && res.statusCode == 200) {
            const account = JSON.parse(body);
      
            if (account.Error) {
              // non-existent account
              return message.channel.send(`The account \`${player}\` is not a valid PB2 account. It may have been disabled or simply does not exist. Try registering another account.`);
            } else if (account.icq != message.author.tag) {
              // existent account, not owned
              return message.channel.send(`Set your PB2 account\'s Discord profile field to \`${message.author.tag}\` to register with that account.`);
            } else if (account.icq == message.author.tag) {
              // existent account, owned
              sqlite.run(`INSERT INTO players (name, discord_id) VALUES ($name, $discordid)`, {
                $name: account.login,
                $discordid: message.author.id
              }).then(() => {
                // Successful registration
                add_verified_role();
                message.reply(`you\'ve been successfully registered as \`${account.login}\`!`);

                const registration_string = `PB2 account [${account.login}] registered under Discord account [${message.author.tag}] (${message.author.id})`;
                
                client.guilds.get(config.bot_server.id)
                    .channels.get(config.bot_server.mod.pl_registration)
                    .send(registration_string.replace(/\[|\]/g, '`'));
                
                console.log(registration_string);                
              }).catch(err => {
                console.log(err);
              });
            }
          }
        });
      }

    });
  }).catch(err => {
    console.log('Failed to access database.')
  });
});