import Discord, { Message } from "discord.js";
import dotenv from "dotenv";
import commands from "./commands";

dotenv.config();

const allowed_channels = JSON.parse(process.env.ALLOW_LIST);

const bot = new Discord.Client();

bot.on("ready", () => {
  console.log(`\nConnected as as ${bot.user.tag}! Mode: ${process.env.NODE_ENV}\n`);
  bot.voiceConnections.forEach(c => c.channel.leave())

  bot.guilds.map((g) => {
    if (process.env.NODE_ENV === "prodution")
      g.systemChannel.send(`Here I'm! Following the whistle of change..
Do you want to know what I can do? Try to type **!help** or **!commands**`)
  })
  process.stdin.resume();
});

process.on("exit", () => {
  console.log("Bot logged out successfully. Exiting process..");
})

bot.on("message", async (msg: Message) => {
  if (!msg.content.startsWith(`${process.env.PREFIX}`)) return;
  else if (msg.author.bot) return
  commands(bot, msg)
});

bot.on("guildMemberAdd", (member) => {
  console.log(member)
})

bot.login(process.env.AUTH_TOKEN)
