import yts from "yt-search";
import { Message } from 'discord.js';

import { execute, stopSong } from "../utils/queue"

export default (bot, msg: Message) => {
    const command = msg.content.split(" ")[0];
    const content = msg.content.split(" ").slice(1).join(" ");
    switch (command) {
        case `${process.env.PREFIX}p`:
            yts(content, async (err, r) => {
                if (r.videos.length > 0) {
                    const song = r.videos[0];
                    execute(msg, song);
                }
            })
            return true;
        case `${process.env.PREFIX}stop`:
            stopSong(msg);
            return true;
    }
}