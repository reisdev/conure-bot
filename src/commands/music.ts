import yts from "yt-search";
import { Message, Client } from 'discord.js';

import { execute, stopSong, pause, resume, skipSong, Song, volume } from "../utils/queue"

export default (bot: Client, msg: Message) => {
    const command = msg.content.split(" ")[0];
    const content = msg.content.split(" ").slice(1).join(" ");
    switch (command) {
        case `${process.env.PREFIX}p`:
            yts(content, async (err, r) => {
                if (r.videos && r.videos.length > 0) {
                    const song: Song[] = r.videos[0];
                    execute(bot, msg, song);
                }
                else {
                    msg.channel.send("Sorry, I couldn't find the song that you asked.")
                }
            })
            return true;
        case `${process.env.PREFIX}stop`:
            stopSong(bot, msg);
            return true;
        case `${process.env.PREFIX}skip`:
            skipSong(bot, msg);
            return true;
        case `${process.env.PREFIX}pause`:
            pause(bot, msg);
            return true;
        case `${process.env.PREFIX}resume`:
            resume(bot, msg);
            return true;
        case `${process.env.PREFIX}vol`:
            volume(bot, msg);
            return true;
        case `${process.env.PREFIX}volume`:
            volume(bot, msg);
            return true;
    }
}