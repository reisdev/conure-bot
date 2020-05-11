import { Client, Message } from "discord.js"

import { skipSong } from "../../utils/music";
import { DiscordBot } from "../..";

const execute = (bot: DiscordBot, msg: Message) => skipSong(bot, msg);

export default {
    name: "skip",
    help: "Skip the current song",
    execute
}