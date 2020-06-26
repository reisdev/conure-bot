import { MessageEmbed, GuildMember } from "discord.js"

const run = (member: GuildMember) => {
    const welcomeEmbed = new MessageEmbed();
    welcomeEmbed.setColor(0xFFBE00)
    welcomeEmbed.setTitle(`Seja bem vindo ao nosso reino, ${member.user.username}#${member.user.discriminator}!`);
    welcomeEmbed.setThumbnail(member.user.avatar ?
        `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}` :
        `https://cdn.discordapp.com/embed/avatars/${member.user.id}/${Number(member.user.discriminator) % 5}`)
    welcomeEmbed.addFields([
        {
            name: "Deixe seu Follow na Twitch",
            value: "[Twitch](https://twitch.tv/reisdev)",
            inline: true
        },
        {
            name: 'Inscreva-se no Youtube',
            value: "[YouTube](https://www.youtube.com/channel/UC4sSLAid-EtLsGB25uO0pDw)"
        },
        {
            name: "Me siga no Twitter!",
            value: "[Twitter](https://twitter.com/reisdev)",
            inline: true
        },
        {
            name: "No Insta também!",
            value: "[Instagram](https://instagram.com/reisdev)",
            inline: true
        },
        {
            name: "E no LinkedIn!",
            value: "[LinkedIn](https://www.linkedin.com/in/matheus-dos-reis-de-jesus/)",
            inline: true
        }
    ]);
    welcomeEmbed.setFooter("ReisDev • © Todos os direitos reservados.")

    member.guild.systemChannel.send(`<@${member.id}>`, { embed: welcomeEmbed })
}

export default {
    name: "guildMemberAdd",
    run
}