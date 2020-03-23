const Discord = require("discord.js");
const bot = new Discord.Client();
require("dotenv").config();

const allowed_channels = JSON.parse(process.env.ALLOW_LIST);

bot.on("ready", () => {
  console.log(`
    Connect as as ${bot.user.tag}!
    `);
});

bot.on("message", msg => {
  if (!allowed_channels.includes(msg.channel.name)) return;
  switch (msg.content.trim()) {
    case "!hello":
      msg.channel.send(`Hello, <@${msg.author.id}>! How're you doing?`);
      break;
  }
});

bot.login(process.env.AUTH_TOKEN);
