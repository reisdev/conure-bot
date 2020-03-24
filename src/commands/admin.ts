import { Client, Message, Collection, Snowflake } from "discord.js";

import logger from "../utils/logger";

const filter = (m) => {
    return m.content.startsWith(`${process.env.PREFIX}`) || m.author.bot
}

export default (bot: Client, msg: Message) => {
    switch (msg.content.trim()) {
        case `${process.env.PREFIX}cleanup`:
            if (msg.member.hasPermission("MANAGE_MESSAGES")) {
                msg.channel.messages.fetch({ limit: 100 }).then((list) => {
                    msg.channel.bulkDelete(list).then(() =>
                        logger(bot, "cleanup", msg.member, `Cleaning up ${list.size} messages`));
                })
            }
            return true;
        case `${process.env.PREFIX}getout`:
            msg.channel.send(`Ok, <@${msg.author.id}> !I'm out..`).then(() => {
                logger(bot, "getout", msg.member);
                bot.voice.connections.forEach(c => c.channel.leave())
                bot.destroy()
                process.exit(0)
            });
            return true;
        case `${process.env.PREFIX}log`:
            if (msg.member.hasPermission("ADMINISTRATOR")) {
                logger(bot, "log", msg.member, msg)
                msg.channel.send(`This message has been logged to the console!`)
            }
            else {
                msg.channel.send("I'm sorry! You have no rights to do this!")
            }
            return true;
        case `${process.env.PREFIX}restart`:
            if (!msg.member.hasPermission("ADMINISTRATOR")) return;
            msg.channel.send(`I'll be back, <@${msg.author.id}>...`);
            bot.destroy()
            bot.login(process.env.AUTH_TOKEN).then(() => msg.channel.send(`Done, <@${msg.author.id}>! I'm back.`));
            return true;
        case `${process.env.PREFIX}rollback`:
            msg.channel.messages.fetch({ limit: 100 }).then((list) => {
                const toDelete = list.filter(m => filter(m))
                msg.channel.bulkDelete(toDelete).then(() =>
                    logger(bot, "cleanup", msg.member, `Cleaning up ${list.size} messages`));
            })
            return true;
        case `${process.env.PREFIX}rs`:
            if (!msg.member.hasPermission("ADMINISTRATOR")) return;
            msg.channel.send(`I'll be back, <@${msg.author.id}>...`);
            bot.destroy()
            bot.login(process.env.AUTH_TOKEN).then(() => msg.channel.send(`Done, <@${msg.author.id}>! I'm back.`));
            return true;
        default:
            return false;
    }
}