import { Channel, VoiceConnection, Message, Client } from "discord.js"
import ytdl from 'ytdl-core-discord';
import logger from "./logger";

class ChannelQueue {
    textChannel: Channel = null;
    voiceChannel: string = null;
    connection: VoiceConnection = null;
    songs: [];
    volume: number = 5;
    playing: Boolean = true;
    constructor(text: Channel, voice: string, conn: VoiceConnection) {
        this.textChannel = text;
        this.voiceChannel = voice;
        this.connection = conn;
        this.songs = [];
    }
}

const serverQueues: Map<string, ChannelQueue> = new Map();

export const execute = async (bot: Client, msg: Message, song) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!song) {
        msg.member.voiceChannel.leave();
        serverQueues.delete(msg.guild.id);
        return;
    }
    if (!queue) {
        if (!msg.member.voiceChannel) {
            msg.channel.send("You need to join a channel to play a song.");
            return;
        }
        const voice = await msg.member.voiceChannel.join();
        queue = new ChannelQueue(msg.channel, msg.member.voiceChannelID, voice);
        queue.songs.push(song);
        serverQueues.set(msg.guild.id, queue);
        playSong(bot, msg, song);
    }
    else {
        queue.songs.push(song);
        msg.channel.send(`Song **${song.title}** was added to the queue.`)
    }
}

export const playSong = async (bot: Client, msg: Message, song) => {
    const queue = serverQueues.get(msg.guild.id);
    if (!song) {
        msg.member.voiceChannel.leave();
        serverQueues.delete(msg.guild.id);
        return;
    }
    queue.textChannel.send(`Now playing: **${song.title}**`);
    logger(bot, "song.play", null, `Playing song ${song.title}`)
    queue.connection
        .playOpusStream(await ytdl(song.url))
        .once("end", () => {
            queue.songs.shift();
            playSong(bot, msg, queue.songs[0]);
        }).on("error", (error) => {
            console.error(error)
            msg.member.voiceChannel.leave();
            queue.connection = null;
        });
}

export const stopSong = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song playing for your current channel.");
    }
    logger(bot, "song.stop", msg.member);
    queue.connection.dispatcher.end();
}

export const skipSong = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song playing for your current channel.");
    }
    logger(bot, "song.skip", msg.member, `Skipping song ${queue.songs[0].title}`)
    queue.connection.dispatcher.end();
}

export const pause = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song to be paused");
    }
    queue.connection.dispatcher.pause();
}

export const resume = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song to be resumed.");
    }
    logger(bot, "song.resume", msg.member, `Resuming song ${queue.songs[0]}`)
    queue.connection.dispatcher.resume();
}