import { Channel, VoiceConnection, Message, Client, TextChannel } from "discord.js"
import ytdl from 'ytdl-core-discord';
import logger from "./logger";

class ChannelQueue {
    textChannel: TextChannel = null;
    voiceChannel: string = null;
    connection: VoiceConnection = null;
    songs: Array<Song>;
    volume: number = 5;
    playing: Boolean = true;
    constructor(text: any, voice: string, conn: VoiceConnection) {
        this.textChannel = text;
        this.voiceChannel = voice;
        this.connection = conn;
        this.songs = [];
    }
}

export class Song {
    type: string
    title: string
    description: string
    videoId: string
    seconds: number
    timestamp: string
    duration: { toString: any, seconds: number, timestamp: string }
    views: number
    thumbnail: string
    image: string
    ago: string
    author: {
        name: string,
        id: string,
        url: string,
        userId: string,
        userName: string,
        userUrl: string,
        channelId: string,
        channelUrl: string,
        channelName: string
    }
}

const serverQueues: Map<string, ChannelQueue> = new Map();

export const execute = async (bot: Client, msg: Message, song) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!song) {
        msg.member.voice.channel.leave();
        serverQueues.delete(msg.guild.id);
        return;
    }
    if (!queue) {
        if (!msg.member.voice.channel) {
            msg.channel.send("You need to join a channel to play a song.");
            return;
        }
        const voice = await msg.member.voice.channel.join();
        queue = new ChannelQueue(msg.channel, msg.member.voice.channelID, voice);
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
        msg.member.voice.channel.leave();
        serverQueues.delete(msg.guild.id);
        return;
    }
    queue.textChannel.send(`Now playing: **${song.title}**`);
    logger(bot, "song.play", null, `Playing song ${song.title}`)
    queue.connection
        .play(await ytdl(song.url, { filter: "audioonly", highWaterMark: 1 << 25 }), { type: "opus" })
        .once("end", () => {
            queue.songs.shift();
            playSong(bot, msg, queue.songs[0]);
        }).on("error", (error) => {
            console.error(error)
            msg.member.voice.channel.leave();
            queue.connection = null;
            serverQueues.delete(msg.guild.id);
        });
}

export const stopSong = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue || !queue.connection) {
        return msg.channel.send("There's no song playing for your current channel.");
    }
    else {
        logger(bot, "song.stop", msg.member);
        serverQueues.delete(msg.guild.id);
        if (queue.connection)
            queue.connection.dispatcher.end();
        msg.member.voice.channel.leave();
    }
}

export const skipSong = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song playing for your current channel.");
    } else {
        if (!queue.songs || queue.songs.length === 0)
            try {
                const song = queue.songs[0];
                if (song !== undefined) {
                    logger(bot, "song.skip", msg.member, `Skipping song ${song.title}`)
                    msg.member.voice.channel.leave();
                } else {
                    throw Error("No song available");
                }
            } catch (e) {
                return msg.channel.send("There's no song playing for your current channel.");
            }
    }
}

export const pause = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song to be paused");
    }
    if (queue.connection)
        queue.connection.dispatcher.pause();
}

export const resume = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song to be resumed.");
    }
    logger(bot, "song.resume", msg.member, `Resuming song ${queue.songs[0]}`)
    if (queue.connection)
        queue.connection.dispatcher.resume();
}

export const volume = async (bot: Client, msg: Message) => {
    const queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("The bot needs to be playing to adjust the volume");
    }
    try {
        const volume = Number(msg.content.split(" ")[1])
        if (volume < 0 || volume > 10) throw new Error("Invalid number");
        queue.connection.dispatcher.setVolume(volume / 10)
        logger(bot, "song.volume", msg.member, `Setting volume to ${volume / 10}`)
    }
    catch (err) {
        msg.channel.send("The volume should be an integer between 0 and 10. e.g.: !vol 5")
    }
}