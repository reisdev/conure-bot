import { Client, Message } from "discord.js"

import { resume } from "../../utils/music";
import { DiscordBot } from "../..";

const execute = (bot: DiscordBot, msg: Message) => resume(bot, msg);

export default {
    name: "resume",
    help: "Resume the current song",
    execute
}