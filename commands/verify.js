import { SlashCommandBuilder } from 'discord.js';
import { verify } from '../util/verification.js';
import fetch from 'node-fetch';
import config from '../storage/config.json' assert { type: 'json' };
import pb2_api_key from '../storage/passwords-esv.json' assert { type: 'json' };
import { equals, resolved } from '../util/helper.js';

export const commandBuilder = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verifies ownership of a specified PB2 account.')
    .addStringOption(option =>
      option
        .setName('account')
        .setDescription('Name of PB2 account used in registration')
        .setRequired(true)),

    async execute(interaction) {
      const account_name = interaction.options.getString('account');
      const pb2_api = `https://plazmaburst2.com/extract.php?login=${account_name}&api_key=${pb2_api_key}`;
      const discord_user = interaction.user;
      const discord_username = discord_user.username;

      const add_roles = (() => verify(interaction.client, interaction.user, account_name));

      const invalid_account = (() => {
        interaction[resolved(interaction)](`The account \`${account_name}\` is not a valid PB2 account. It may have been disabled or simply does not exist. Try verifying with another account.`)
      });

      // where the magic happens
      const users = (await interaction.client.database.collection('verified').findOne({})).data;

      const verified_account = users[discord_user.id]
        ? users[discord_user.id].find(u => equals(u, account_name))
        : null;
      
      if (verified_account) {
        console.log(`${discord_user.username} attempted to verify as ${verified_account}, but already verified.`);
        add_roles();
        interaction[resolved(interaction)](`You are already verified as ${verified_account}.`);

      } else {
        if (account_name.length < 3) return invalid_account();

        // not already in database
        fetch(url).then(response => {
          if (!response || response.status != 200) return console.log(`Invalid status/status code: ${response.status} ${response.statusText}`);
          return response.json();
        }).then(response => {

          const pb2_account = response; // JSON.parse(response.body);
          const discord_field = pb2_account.icq;
    
          if (pb2_account.Error) {
            // non-existent account
            return invalid_account();

          } else if (discord_username != discord_field) {
            // existing account, not owned
            return interaction[resolved(interaction)](`Set your PB2 account\'s Discord profile field to \`${discord_tag}\` to verify yourself as that account.`);

          } else {
            // existing account, owned
            let new_user_list = users[discord_user.id] ? users[discord_user.id].slice(0) : [];
            new_user_list.push(pb2_account.login);
    
            users[discord_user.id] = new_user_list;        
    
            // actually updates document
            client.database.collection('verified').updateOne({}, { $set: { 'data': users } });
    
            add_roles();
    
            if (config.bot_server) {
              const today = new Date();
              const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
              const ver_message = `${discord_username} (<@${discord_user.id}>) has verified as \`${pb2_account.login}\` (on ${formatted_date})`;
    
              client.channels.fetch(config.bot_server.mod.pl_verification).then(channel => {
                channel.send(ver_message);
              });
            }
    
            interaction[resolved(interaction)](`You\'ve been successfully verified as \`${pb2_account.login}\`!`);
          }
        }).catch(err => console.log(err));
      }

    }
}