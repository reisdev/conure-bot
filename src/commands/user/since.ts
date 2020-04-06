import { Client, Message } from "discord.js"
import moment from "moment"

const execute = (bot: Client, msg: Message, args) => {
    const since = moment(msg.member.joinedTimestamp).format("DD/MM/YYYY");
    msg.channel.send({
        embed: {
            author: {
                name: msg.guild.name,
                icon_url: `https://cdn.discordapp.com/icons/${msg.guild.id}/${msg.guild.icon}.png`
            },
            title: msg.member.nickname || msg.author.username,
            thumbnail: {
                url: "https://cdn.discordapp.com/" + (msg.author.avatar !== null ? `avatars/${msg.author.id}/${msg.author.avatar}.png` : `embed/avatars/${Number(msg.author.discriminator) % 5}.png `)
            },
            description: `Congratulations! You are a member of this server since ${since}.`,
            timestamp: new Date()
        }
    });
}

export default {
    name: "since",
    help: "Information about user lifetime in the Server",
    execute
}