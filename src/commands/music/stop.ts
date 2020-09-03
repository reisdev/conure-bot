import { Message } from "discord.js"

import { DiscordBot } from "../..";

const run = async (bot: DiscordBot, msg: Message) => {
    let queue = bot.queues.get(msg.guild.id);
    if (!queue || !queue.connection) {
        return msg.reply("There's no song playing for your current channel.");
    }
    else {
        bot.logger("song.stop", msg.member);
        queue.connection?.dispatcher?.end();
    }
}

export default {
    name: "stop",
    help: "Stop the current song and leaves the channel",
    run
}