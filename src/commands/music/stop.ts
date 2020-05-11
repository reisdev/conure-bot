import { Client, Message } from "discord.js"

import { stopSong } from "../../utils/music";
import { DiscordBot } from "../..";

const execute = (bot: DiscordBot, msg: Message) => stopSong(bot, msg);

export default {
    name: "stop",
    help: "Stop the current song and leaves the channel",
    execute
}