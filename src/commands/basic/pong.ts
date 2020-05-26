import { Client, Message } from "discord.js";
import { DiscordBot } from "../..";

const run = (bot: DiscordBot, msg: Message) => msg.channel.send(`<@${msg.author.id}> pong!`)

export default {
    name: "ping",
    help: "Pong!",
    run
}