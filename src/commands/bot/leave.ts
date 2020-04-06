import { Client, Message } from "discord.js";

const execute = (bot: Client, msg: Message) => {
    if (msg.member.voice.channel)
        msg.member.voice.channel.leave();
    else {
        msg.channel.send("I'm not connected to any voice channel, sorry!")
    }
}

export default {
    name: "leave",
    help: "The bot leaves the current voice channel",
    execute
}