import preset from "./preset";
import { Message, Client } from "discord.js";

export default (bot: Client, msg: Message) => {
    switch (msg.content.trim()) {
        case `${process.env.PREFIX}commands`:
            msg.channel.send(preset.commands + (msg.member.hasPermission("ADMINISTRATOR") ? preset.adminCommands : ""))
            return true;
        case `${process.env.PREFIX}hello`:
            msg.channel.send(`Hello, <@${msg.author.id}>! How're you doing?`);
            return true;
        case `${process.env.PREFIX}help`:
            msg.channel.send(preset.commands + (msg.member.hasPermission("ADMINISTRATOR") ? preset.adminCommands : ""))
            return true;
        case `${process.env.PREFIX}ping`:
            msg.channel.send(`<@${msg.author.id}> pong!`)
            return true;
        default:
            return false;
    }
}