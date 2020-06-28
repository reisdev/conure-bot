import { Message } from "discord.js"

import { volume } from "../../utils/music";
import { DiscordBot } from "../..";

const run = (bot: DiscordBot, msg: Message, args: string[]) => volume(bot, msg, Number(args[0]));

export default {
    name: "vol",
    help: "Change the song volume",
    run
}