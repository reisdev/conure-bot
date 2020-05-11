import { GuildMember, Client } from "discord.js";

export default function (command: string, member: GuildMember = null, description: any = null) {
    if (typeof description === "object") {
        if (member) {
            console.log(`[${member.user.username}#${member.user.discriminator} : ${command}]`)
        }
        else {
            console.log(`[${this.user.username}#${this.user.discriminator} : ${command}]`)
        }
        if (description) console.log(description);
    }
    else {
        if (member) {
            console.log(`[${member.user.username}#${member.user.discriminator} : ${command}] ${description || ""}`)
        }
        else {
            console.log(`[${this.user.username}#${this.user.discriminator} : ${command}] ${description || ""}`)
        }
    }
}