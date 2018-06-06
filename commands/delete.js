const config = require('../config.json');
const sqlite = require('sqlite');

exports.run = ((client, message, args) => {
  const id = Number(args[1]);
  const table = args[0];
  const format = `\`${config.prefix}delete {teams|players} {id}\``;

  if (message.author.id != config.ownerID) return;

  if (!/^teams$|^players$/i.test(table) || isNaN(id)) {
    return message.channel.send(`The correct format for that command is ${format}`);
  }

  sqlite.open(`./${config.db}`).then(() => {
    sqlite.get(`SELECT * FROM ${table} WHERE id=\"${id}\"`).then(row => {
      if (!row) return message.channel.send('Unmatched player ID.');
 
      sqlite.run(`DELETE FROM ${table} WHERE id=\"${id}\"`).then(() => {
        message.channel.send(`Removed player \`${player.name}\` with player ID \`${row.id}\` removed from PL.`);
      }).catch(err => {
        console.log(err);
      });
    });
  });
});