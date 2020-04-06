import { Client, Message, Collection } from 'discord.js'

const execute = (bot: Client, msg: Message, args: string[]) => {
    let string = "";
    let adminString = "";
    const commands = (bot["commands"] as Collection<string, any>).array().sort((a, b) => a.name > b.name ? 1 : -1)
    commands.forEach(command => {
        if (command.help) {
            if (command.admin && msg.member.hasPermission("ADMINISTRATOR")) {
                adminString += `\n${process.env.PREFIX}${command.name}: ${command.help}`
            } else if (!command.admin) {
                string += `\n${process.env.PREFIX}${command.name}: ${command.help}`
            }
        }
    })
    msg.channel.send(`**Basic:** \`\`\`bash ${string} \`\`\`\n${adminString.length > 0 ? `**Admin:**\n\`\`\`bash\n${adminString}\n\`\`\` ` : ""}`);
}

export default {
    name: "help",
    execute
}