import preset from "./preset";

export default (bot, msg) => {
    switch (msg.content.trim()) {
        case `${process.env.PREFIX}commands`:
            msg.channel.send(preset.commands)
            return true;
        case `${process.env.PREFIX}hello`:
            msg.channel.send(`Hello, <@${msg.author.id}>! How're you doing?`);
            return true;
        case `${process.env.PREFIX}help`:
            msg.channel.send(preset.commands)
            return true;
        case `${process.env.PREFIX}ping`:
            msg.channel.send(`<@${msg.author.id}> pong!`)
            return true;
        default:
            return false;
    }
}