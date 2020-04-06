import { Client, Message } from "discord.js"

import { stopSong } from "../../utils/music";

const execute = (bot: Client, msg: Message) => stopSong(bot, msg);

export default {
    name: "stop",
    help: "Stop the current song and leaves the channel",
    execute
}