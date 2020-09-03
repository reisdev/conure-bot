import Discord, { Message } from "discord.js";
import dotenv from "dotenv";
import path from "path"
import fs from "fs";

import { ChannelQueue } from './utils/music'
import logger from "./utils/logger";

dotenv.config();

export class DiscordBot extends Discord.Client {
  commands: Discord.Collection<string, any>;
  queues: Map<string, ChannelQueue>;
  logger = logger;
}

const bot = new DiscordBot();
bot.commands = new Discord.Collection();

const commandsFolder = fs.readdirSync(path.join(__dirname, "/commands"))

for (var folder of commandsFolder) {
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
  bot.logger("error", null, err);
})

bot.on("message", async (msg: Message) => {
  if (!msg.content.startsWith(`${process.env.PREFIX}`) || msg.author.bot) return;
  const args = msg.content.slice(process.env.PREFIX.length).split(" ");
  const command = args.shift();
  try {
    bot.commands.get(command).run(bot, msg, args);
  } catch (e) {
    msg.reply("Sorry! I don't know this command")
  }
});

const eventsFolder = fs.readdirSync(path.join(__dirname, "/events"))

for (var filename of eventsFolder) {
  const event = require(`./events/${filename}`).default;
  const [eventName]: string[] = filename.split(".")
  bot.on(eventName as any, (...args) => event(bot, ...args));
}

bot.login(process.env.TOKEN)
