import { Client, Message } from "discord.js";
import logger from "../../utils/logger"


const execute = (bot: Client, msg: Message, args: string[]) => {
    if (msg.member.hasPermission("ADMINISTRATOR")) {
        logger(bot, "log", msg.member, msg)
        msg.channel.send(`This message has been logged to the console!`)
    }
    else {
        msg.channel.send("I'm sorry! You have no rights to do this!")
    }
}

export default {
    name: "log",
    help: "console.log the current message",
    admin: true,
    execute
}