import { Client, Message } from "discord.js";

const execute = (bot: Client, msg: Message, args: string[]) => msg.channel.send(`Hello, <@${msg.author.id}>! How're you doing?`);

export default {
    name: "hello",
    help: "Hello, world!",
    execute
}