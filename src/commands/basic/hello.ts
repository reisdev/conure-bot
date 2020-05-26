import { Client, Message } from "discord.js";
import { DiscordBot } from "../..";

const run = (bot: DiscordBot, msg: Message, args: string[]) => msg.channel.send(`Hello, <@${msg.author.id}>! How're you doing?`);

export default {
    name: "hello",
    help: "Hello, world!",
    run
}