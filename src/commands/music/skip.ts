import { Message } from "discord.js"

import { playSong, cleanupQueue } from "../../utils/music";
import { DiscordBot } from "../..";

const run = async (bot: DiscordBot, msg: Message) => {
    let queue = bot.queues.get(msg.guild.id);
    if (!queue) {
        return msg.reply("There's no song playing for your current channel.");
    } else {
        try {
            const song = queue.songs[0];
            if (song !== undefined) {
                bot.logger("song.skip", msg.member, `Skipping song ${song.title}`)
                queue.songs.shift();
                playSong(bot, msg, queue.songs[0]);
            } else {
                cleanupQueue(bot, msg, msg.guild.id);
                throw Error("No song available");
            }
        } catch (e) {
            return msg.reply("There's no song playing for your current channel.");
        }
    }
}

export default {
    name: "skip",
    help: "Skip the current song",
    run
}