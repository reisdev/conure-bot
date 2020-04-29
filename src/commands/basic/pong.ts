import { Client, Message } from "discord.js";

const execute = (bot: Client, msg: Message) => msg.channel.send(`<@${msg.author.id}> pong!`)

export default {
    name: "ping",
    help: "Pong!",
    execute
}