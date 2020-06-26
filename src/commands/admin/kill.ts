import { Message } from "discord.js"
import { DiscordBot } from "../..";

const run = (bot: DiscordBot, msg: Message, args: string[]) => {
    if (!msg.member.hasPermission("ADMINISTRATOR")) return;
    msg.reply(` I'm out..`).then(() => {
        bot.logger("kill", msg.member);
        bot.voice.connections.forEach(c => c.channel.leave())
        bot.destroy()
        process.exit(0)
    });
}

export default {
    name: "kill",
    help: "Kills the bot process",
    admin: true,
    run
}