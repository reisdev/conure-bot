import { Message } from "discord.js";

import { searchSong } from "../../utils/music";
import { DiscordBot } from "../..";

const run = (bot: DiscordBot, msg: Message, args: string[]) => searchSong(bot, msg, args.join(" "));

export default {
    name: "p",
    help: "Search for the given song and plays it",
    run
}