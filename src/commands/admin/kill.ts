import { Client, Message } from "discord.js"
import logger from "../../utils/logger";

const execute = (bot: Client, msg: Message, args: string[]) => {
    if (!msg.member.hasPermission("ADMINISTRATOR")) return;
    msg.channel.send(`Ok, <@${msg.author.id}> !I'm out..`).then(() => {
        logger(bot, "kill", msg.member);
        bot.voice.connections.forEach(c => c.channel.leave())
        bot.destroy()
        process.exit(0)
    });
}

export default {
    name: "kill",
    help: "Kills the bot process",
    admin: true,
    execute
}