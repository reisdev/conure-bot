import { Channel, VoiceChannel, VoiceConnection, Message } from "discord.js"
import ytdl from 'ytdl-core-discord';

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

export const execute = async (msg: Message, song) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!song) {
        msg.member.voiceChannel.leave();
        serverQueues.delete(msg.guild.id);
        return;
    }
    if (!queue) {
        const voice = await msg.member.voiceChannel.join();
        queue = new ChannelQueue(msg.channel, msg.member.voiceChannelID, voice);
        queue.songs.push(song);
        serverQueues.set(msg.guild.id, queue);
        playSong(msg, song);
    }
    else {
        queue.songs.push(song);
        msg.channel.send(`Song **${song.title}** was added to the queue.`)
    }
}

export const playSong = async (msg: Message, song) => {
    const queue = serverQueues.get(msg.guild.id);
    if (!song) {
        msg.member.voiceChannel.leave();
        serverQueues.delete(msg.guild.id);
        return;
    }
    queue.textChannel.send(`Now playing: **${song.title}**`);
    queue.connection
        .playOpusStream(await ytdl(song.url))
        .once("end", () => {
            queue.songs.shift();
            playSong(msg, queue.songs[0]);
        }).on("error", (error) => {
            console.error(error)
            msg.member.voiceChannel.leave();
        });
}

export const stopSong = async (msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        msg.channel.send("There's no song playing for your current channel");
        return;
    }
    queue.connection.dispatcher.end();
}