export default (bot, msg) => {
    switch (msg.content.trim()) {
        case `${process.env.PREFIX}cleanup`:
            if (msg.member.hasPermission("MANAGE_MESSAGES")) {
                msg.channel.fetchMessages().then((list) => {
                    msg.channel.bulkDelete(list);
                })
            }
            return true;
        case `${process.env.PREFIX}log`:
            if (msg.member.hasPermission("ADMINISTRATOR")) {
                console.log(msg)
                msg.channel.send(`This message has been logged to the console!`)
            }
            else {
                msg.channel.send("I'm sorry! You have no rights to do this!")
            }
            return true;
        case `${process.env.PREFIX}getout`:
            msg.channel.send(`Ok, <@${msg.author.id}> !I'm out..`).then(() => {
                bot.voiceConnections.forEach(c => c.channel.leave())
                bot.destroy().then(() => {
                    process.exit(0);
                })
            });
            return true;
        case `${process.env.PREFIX}rollback`:
            (async () => await msg.channel.fetchMessages().then(list => {
                list.map(m => m.author.id === bot.user.id || m.content.startsWith(`${process.env.PREFIX}`) ? m.delete() : "");
            }))()
            return true;
        default:
            return false;
    }
}