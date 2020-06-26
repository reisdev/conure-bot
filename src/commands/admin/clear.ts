import { Message } from "discord.js"
import { DiscordBot } from "../..";

const filter = (m) => {
    return m.content.startsWith(`${process.env.PREFIX}`) || m.author.bot
}

const run = (bot: DiscordBot, msg: Message, args: string[]) => {
    if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.channel.send("Sorry, you have no rights to do this");
    msg.channel.messages.fetch({ limit: 100 }).then((list) => {
        const toDelete = list.filter(m => filter(m))
        msg.channel.bulkDelete(toDelete).catch((e) => {
            msg.channel.send("Sorry, I have no rights to do this!");
        }).then(() => {
            bot.logger("cleanup", msg.member, `Cleaning up ${list.size} messages`);
        })
    })
}

export default {
    name: "clear",
    help: "Clear the last bot messages from the channel",
    admin: true,
    run
}