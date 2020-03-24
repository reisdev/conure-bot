import { Client, Message } from "discord.js";

export default (bot: Client, msg: Message) => {
    switch (msg.content.trim()) {
        case `${process.env.PREFIX}leave`:
            if (msg.member.voice.channel)
                msg.member.voice.channel.leave();
            else {
                msg.channel.send("I'm not connected to any voice channel, sorry!")
            }
            return true;
    }
}