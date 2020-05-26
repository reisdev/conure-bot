import { Client, Message } from "discord.js";
import { DiscordBot } from "../..";

const run = (bot: DiscordBot, msg: Message, args: string[]) => {
    if (!msg.member.hasPermission("ADMINISTRATOR")) return;
    msg.channel.send(`I'll be back, <@${msg.author.id}>...`);
    bot.destroy()
    bot.login(process.env.TOKEN).then(() => msg.channel.send(`Done, <@${msg.author.id}>! I'm back.`));
}

export default {
    name: "rs",
    help: "Restart the bot server",
    admin: true,
    run
}