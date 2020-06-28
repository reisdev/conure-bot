import { MessageEmbed, GuildMember, TextChannel } from "discord.js"

const run = (member: GuildMember) => {
    const welcomeEmbed = new MessageEmbed();
    welcomeEmbed.setColor(0xFFBE00)
        .setTitle(`${member.user.username}#${member.user.discriminator} chegou no nosso reino!`)
        .setDescription(`Você é x ${member.guild.memberCount}º por aqui! Seja bem-vindx! Me siga nas redes sociais:`)
        .setThumbnail(member.user.avatar ?
            `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}` :
            `https://cdn.discordapp.com/embed/avatars/${member.user.id}/${Number(member.user.discriminator) % 5}`)
        .addFields([
            {
                name: ":purple_circle: Twitch",
                value: "[ReisDev](https://twitch.tv/reisdev)",
                inline: true
            },
            {
                name: ':red_circle: Youtube',
                value: "[ReisDev](https://www.youtube.com/channel/UC4sSLAid-EtLsGB25uO0pDw)",
                inline: true
            },
            {
                name: ":bird: Twitter",
                value: "[@reisdev](https://twitter.com/reisdev)",
                inline: true
            },
            {
                name: ":frame_photo: Instagram",
                value: "[@reisdev](https://instagram.com/reisdev)",
                inline: true
            },
            {
                name: ":link: LinkedIn",
                value: "[Matheus dos Reis](https://www.linkedin.com/in/matheus-dos-reis-de-jesus/)",
                inline: true
            }
        ])
        .setFooter("ReisDev • © Todos os direitos reservados.", `https://cdn.discordapp.com/icons/${member.guild.id}/${member.guild.icon}.png`)

    member.guild.systemChannel.send(`<@${member.id}>`, { embed: welcomeEmbed })
}

export default run