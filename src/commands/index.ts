import admin from "./admin";
import basic from "./basic";
import user from "./user";
import music from "./music"
import Bot from "./bot"

export default (bot, msg) => {
    try {
        const answered = basic(bot, msg) || admin(bot, msg) || user(bot, msg) || music(bot, msg) || Bot(bot, msg);
        if (!answered) throw Error("Not command found");
    } catch (e) {
        console.log(e);
        msg.channel.send(`Uh oh! I don't know this command! Try **!help** of **!command** to discover what I can do`)
    }
}