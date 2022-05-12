export const run = ((client, message, args) => {
  message.channel.send(`Pong! \`${Date.now() - message.createdTimestamp}ms\` | API Latency: \`${Math.round(client.ws.ping)}ms\``);
});