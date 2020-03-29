import { Message, Client } from 'discord.js';

import {
    searchSong, stopSong, emptyQueue,
    skipSong, pause, resume, volume
} from "../utils/queue"

export default (bot: Client, msg: Message) => {
    const command = msg.content.split(" ")[0];
    const content = msg.content.split(" ").slice(1).join(" ");
    switch (command) {
        case `${process.env.PREFIX}p`:
            searchSong(bot, msg, content);
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
        case `${process.env.PREFIX}cleanup`:
            emptyQueue(bot, msg);
            return true;
    }
}