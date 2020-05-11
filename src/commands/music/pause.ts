import { Client, Message } from "discord.js"

import { pause } from "../../utils/music";
import { DiscordBot } from "../..";

const execute = (bot: DiscordBot, msg: Message) => pause(bot, msg);

export default {
    name: "pause",
    help: "Pause the current song",
    execute
}