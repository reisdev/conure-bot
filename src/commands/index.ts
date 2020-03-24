import admin from "./admin";
import basic from "./basic";
import user from "./user";
import music from "./music"
import Bot from "./bot"
import logger from "../utils/logger";
import { Client, Message } from "discord.js";

export default (bot: Client, msg: Message) => {
    try {
        const answered = basic(bot, msg) || admin(bot, msg) || user(bot, msg) || music(bot, msg) || Bot(bot, msg);
        if (!answered) {
            logger(bot, msg.content, msg.member, "Command not found")
            throw Error("Command not found");
        }
    } catch (e) {
        msg.channel.send(`Uh oh! I don't know this command! Try **!help** of **!command** to discover what I can do`)
    }
}