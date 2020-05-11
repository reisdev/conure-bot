import Discord, { Message } from "discord.js";
import dotenv from "dotenv";
import logger from "./utils/logger";
import { ChannelQueue } from './utils/music'
import fs from "fs";
import path from "path"

dotenv.config();

export class DiscordBot extends Discord.Client {
  commands: Discord.Collection<string, any>;
  queues: Map<string, ChannelQueue>;
}

const bot = new DiscordBot();
bot.commands = new Discord.Collection();

const folders = fs.readdirSync(path.join(__dirname, "/commands"))

for (var folder of folders) {
  const files = fs.readdirSync(path.join(__dirname, "/commands", folder)).filter((filename) => /^.*\.(t|j)s$/.test(filename))
  for (var filename of files) {
    const command = require(`./commands/${folder}/${filename}`).default;
    bot.commands.set(command.name, command);
  }
}

const closeBot = () => {
  bot.destroy();
  bot.queues.forEach(queue => {
    if (queue.connection)
      queue.connection.disconnect()
  })
  console.log("Bot logged out successfully. Exiting process..");
}

process.on("beforeExit", closeBot)

process.on("SIGINT", closeBot)

process.on("SIGTERM", closeBot)

bot.on("ready", () => {
  console.log(`Connected as as ${bot.user.tag}! Mode: ${process.env.NODE_ENV}\n`);
  bot.queues = new Map<string, ChannelQueue>();
  process.stdin.resume();
});

bot.on("error", (err) => {
  logger(bot, "error", null, err);
})

bot.on("message", async (msg: Message) => {
  if (!msg.content.startsWith(`${process.env.PREFIX}`) || msg.author.bot) return;
  const args = msg.content.slice(process.env.PREFIX.length).split(" ");
  const command = args.shift();
  try {
    bot.commands.get(command).execute(bot, msg, args);
  } catch (e) {
    msg.reply("Sorry! I don't know this command")
  }
});

bot.on("guildMemberAdd", (member) => {
  member.guild.systemChannel.send(`Welcome aboard, <@${member.id}>!`)
})

bot.login(process.env.TOKEN)
