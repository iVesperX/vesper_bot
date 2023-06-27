export const run = ((client, message, args) => {
  const clientID = client.user.id;
  
  message.channel.send(`https://discordapp.com/oauth2/authorize?client_id=${clientID}&scope=bot&permissions=19457`);
});