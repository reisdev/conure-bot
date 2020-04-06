import { Client, Message } from "discord.js";

const execute = (bot: Client, msg: Message, args: string[]) => {
    if (!msg.member.hasPermission("ADMINISTRATOR")) return;
    msg.channel.send(`I'll be back, <@${msg.author.id}>...`);
    bot.destroy()
    bot.login(process.env.AUTH_TOKEN).then(() => msg.channel.send(`Done, <@${msg.author.id}>! I'm back.`));
}

export default {
    name: "rs",
    help: "Restart the bot server",
    admin: true,
    execute
}