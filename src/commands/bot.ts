import { Client, Message } from "discord.js";

export default (bot: Client, msg: Message) => {
    switch (msg.content.trim()) {
        case `${process.env.PREFIX}leave`:
            if (msg.member.voiceChannel)
                msg.member.voiceChannel.leave();
            else {
                msg.channel.send("I'm not connected to any voice channel, sorry!")
            }
            return true;
    }
}