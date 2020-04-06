import { Client, Message } from "discord.js"

import { pause } from "../../utils/music";

const execute = (bot: Client, msg: Message) => pause(bot, msg);

export default {
    name: "pause",
    help: "Pause the current song",
    execute
}