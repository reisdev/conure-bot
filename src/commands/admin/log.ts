import { Message } from "discord.js";
import { DiscordBot } from "../..";


const run = (bot: DiscordBot, msg: Message, args: string[]) => {
    if (msg.member.id !== "229453643219337217") return
    bot.logger("log", msg.member, msg)
    msg.channel.send(`This message has been logged to the console!`)
}

export default {
    name: "log",
    help: "console.log the current message",
    admin: true,
    run
}