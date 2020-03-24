import { GuildMember, Client } from "discord.js";

export default (bot: Client, command: string, member: GuildMember, description: any = null) => {
    if (typeof description === "object") {
        if (member) {
            console.log(`[${member.user.username}#${member.user.discriminator} : ${command}]`)
        }
        else {
            console.log(`[${bot.user.username}#${bot.user.discriminator} : ${command}]`)
        }
        console.log(description)
    }
    else {
        if (member) {
            console.log(`[${member.user.username}#${member.user.discriminator} : ${command}] ${description || ""}`)
        }
        else {
            console.log(`[${bot.user.username}#${bot.user.discriminator} : ${command}] ${description || ""}`)
        }
    }
}