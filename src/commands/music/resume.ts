import { Client, Message } from "discord.js"

import { resume } from "../../utils/music";

const execute = (bot: Client, msg: Message) => resume(bot, msg);

export default {
    name: "resume",
    help: "Resume the current song",
    execute
}