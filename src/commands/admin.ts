import { Client, Message, Collection } from "discord.js";

import logger from "../utils/logger";

export default (bot: Client, msg: Message) => {
    switch (msg.content.trim()) {
        case `${process.env.PREFIX}cleanup`:
            if (msg.member.hasPermission("MANAGE_MESSAGES")) {
                msg.channel.fetchMessages().then((list: Collection<string, Message>) => {
                    msg.channel.bulkDelete(list);
                    logger(bot, "cleanup", msg.member, `Cleaning up ${list.size} messages`);
                })
            }
            return true;
        case `${process.env.PREFIX}getout`:
            msg.channel.send(`Ok, <@${msg.author.id}> !I'm out..`).then(() => {
                logger(bot, "getout", msg.member);
                bot.voiceConnections.forEach(c => c.channel.leave())
                bot.destroy().then(() => {
                    process.exit(0);
                })
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
            bot.destroy().then(() => {
                bot.login(process.env.AUTH_TOKEN).then(() => msg.channel.send(`Done, <@${msg.author.id}>! I'm back.`));
            });
            return true;
        case `${process.env.PREFIX}rollback`:
            (async () => await msg.channel.fetchMessages().then(list => {
                logger(bot, "rollback", msg.member, "Cleaning up messages...");
                list.map(m => {
                    try {
                        if (m.author.id === bot.user.id || m.content.startsWith(`${process.env.PREFIX}`)) m.delete()
                    }
                    catch (e) {

                    }
                });
            }))()
            return true;
        case `${process.env.PREFIX}rs`:
            if (!msg.member.hasPermission("ADMINISTRATOR")) return;
            msg.channel.send(`I'll be back, <@${msg.author.id}>...`);
            bot.destroy().then(() => {
                bot.login(process.env.AUTH_TOKEN).then(() => msg.channel.send(`Done, <@${msg.author.id}>! I'm back.`));
            });
            return true;
        default:
            return false;
    }
}