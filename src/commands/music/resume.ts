import { Client, Message } from "discord.js"

import { DiscordBot } from "../..";

const run = async (bot: DiscordBot, msg: Message) => {
    let queue = bot.queues.get(msg.guild.id);
    if (!queue) {
        return msg.reply("there's no song to be resumed.");
    }
    if (queue.connection && queue.connection.dispatcher) {
        bot.logger("song.resume", msg.member, `Resuming song ${queue.songs[0].title}`)
        queue.connection.dispatcher.resume();
    }
};

export default {
    name: "resume",
    help: "Resume the current song",
    run
}