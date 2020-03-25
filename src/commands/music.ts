import yts from "yt-search";
import { Message, Client } from 'discord.js';

import { execute, stopSong, pause, resume, skipSong, Song, volume } from "../utils/queue"
import logger from "../utils/logger";

export default (bot: Client, msg: Message) => {
    const command = msg.content.split(" ")[0];
    const content = msg.content.split(" ").slice(1).join(" ");
    switch (command) {
        case `${process.env.PREFIX}p`:
            yts(content, async (err, r) => {
                if (err) {
                    msg.channel.send("Sorry, I had a problem to search your music! Trying again later...")
                    return logger(bot, "song.play", msg.member, err)
                }
                if (r.videos && r.videos.length > 0) {
                    let song: Song = r.videos.shift();
                    while (song && song.duration.seconds > 600) song = r.videos.shift();
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