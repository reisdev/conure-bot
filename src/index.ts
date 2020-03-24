import Discord, { Message } from "discord.js";
import dotenv from "dotenv";
import commands from "./commands";
import logger from "./utils/logger";

dotenv.config();

const bot = new Discord.Client();

bot.on("ready", () => {
  console.log(`Connected as as ${bot.user.tag}! Mode: ${process.env.NODE_ENV}\n`);
  bot.voice.connections.forEach(c => c.channel.leave())

  bot.guilds.cache.map((g) => {
    if (process.env.NODE_ENV === "production") {
      try {
        g.systemChannel.send(`Here I am! Following the whistle of change..
Do you want to know what I can do? Try to type **!help** or **!commands**`)
      } catch (e) {
        logger(bot, "startup", null, "Missing message permission for System Channel")
      }
    }
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
