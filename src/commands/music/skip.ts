import { Client, Message } from "discord.js"

import { skipSong } from "../../utils/music";

const execute = (bot: Client, msg: Message) => skipSong(bot, msg);

export default {
    name: "skip",
    help: "Skip the current song",
    execute
}