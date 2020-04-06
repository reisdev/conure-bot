import { Client, Message } from "discord.js";

import { searchSong } from "../../utils/music";

const execute = (bot: Client, msg: Message, args: string[]) => searchSong(bot, msg, args.join(" "));

export default {
    name: "p",
    help: "Search for the given song and plays it",
    execute
}