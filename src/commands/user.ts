import moment from 'moment'
import Discord, { Client, Message } from "discord.js";

export default (bot: Client, msg: Message) => {
    switch (msg.content.trim()) {
        case `${process.env.PREFIX}since`:
            const since = moment(msg.member.joinedTimestamp).format("DD/MM/YYYY");
            msg.channel.send({
                embed: {
                    author: {
                        name: msg.guild.name,
                        icon_url: `https://cdn.discordapp.com/icons/${msg.guild.id}/${msg.guild.icon}.png`
                    },
                    title: msg.member.nickname || msg.author.username,
                    thumbnail: {
                        url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
                    },
                    description: `Congratulations! You are a member of this server since ${since}.`,
                    timestamp: true
                }
            });
            return true;
        default:
            return false;
    }

}
