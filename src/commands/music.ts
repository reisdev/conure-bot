import yts from "yt-search";
import ytdl from "ytdl-core-discord";
import { Message, Client } from 'discord.js';

import { execute, stopSong, pause, resume, skipSong, Song, volume } from "../utils/queue"
import logger from "../utils/logger";

export default (bot: Client, msg: Message) => {
    const command = msg.content.split(" ")[0];
    const content = msg.content.split(" ").slice(1).join(" ");
    switch (command) {
        case `${process.env.PREFIX}p`:
            if (content.startsWith("http")) {
                ytdl.getInfo(content).then((r) => {
                    const song = new Song();
                    song.title = r.title;
                    song.url = r.video_url;
                    song.videoId = r.video_id;
                    song.seconds = Number(r.length_seconds);
                    song.description = r.description;
                    song.author = {
                        id: r.author.id,
                        url: r.author.user_url,
                        channelId: r.author.id,
                        name: r.author.name,
                        channelUrl: r.author.channel_url,
                        userId: r.author.id,
                        userUrl: r.author.user_url,
                        userName: r.author.user,
                        channelName: r.author.user
                    }
                    execute(bot, msg, song)
                })
            }
            else yts(content, async (err, r) => {
                if (err) {
                    msg.channel.send("Sorry, I had a problem to search your music! Trying again later...")
                    return logger(bot, "song.play", msg.member, err)
                }
                if (r.videos && r.videos.length > 0) {
                    let song: Song = r.videos.shift();
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