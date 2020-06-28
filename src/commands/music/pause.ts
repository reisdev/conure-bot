import { Message } from "discord.js"

import { DiscordBot } from "../..";

const run = async (bot: DiscordBot, msg: Message) => {
    let queue = bot.queues.get(msg.guild.id);
    if (!queue) {
        return msg.reply("there's no song to be paused.");
    }
    if (queue.connection && queue.connection.dispatcher) {
        bot.logger("song.pause", null);
        queue.connection.dispatcher.pause();
    }
}

export default {
    name: "pause",
    help: "Pause the current song",
    run
}