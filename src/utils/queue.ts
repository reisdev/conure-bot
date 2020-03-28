import { Channel, VoiceConnection, Message, Client, TextChannel, VoiceChannel } from "discord.js"
import ytdl from 'ytdl-core-discord';
import logger from "./logger";

class ChannelQueue {
    textChannel: TextChannel = null;
    voiceChannel: string = null;
    connection: VoiceConnection = null;
    songs: Array<Song>;
    volume: number = 0.5;
    playing: Boolean = true;
    constructor(text: any, voice: string, conn: VoiceConnection) {
        this.textChannel = text;
        this.voiceChannel = voice;
        this.connection = conn;
        this.songs = [];
    }
}

export class Song {
    type: string;
    title: string;
    description: string;
    url: string;
    videoId: string;
    seconds: number;
    timestamp: string;
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

export const serverQueues: Map<string, ChannelQueue> = new Map();

export const execute = async (bot: Client, msg: Message, song) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!song) {
        return cleanupQueue(bot, msg);
    }
    if (!queue) {
        if (!msg.member.voice.channel) {
            msg.channel.send(`You need to join the channel to play a song.`);
            return;
        }
        try {
            createQueue(bot, msg, song).then((queue) => {
                playSong(bot, msg, song);
            })
        } catch (e) {
            msg.channel.send("Uh.. sorry, I had a problem! Can you try again? Please!")
        }
    }
    else {
        const channel: VoiceChannel = bot.channels.cache.get(queue.voiceChannel) as VoiceChannel;
        if (!msg.member.voice.channel || msg.member.voice.channel.id !== channel.id) {
            msg.channel.send(`You need to join the voice channel <#${channel.id}> to play a song.`);
            return;
        }
        queue.songs.push(song);
        queue.textChannel.send({
            embed: {
                title: song.title,
                url: song.url,
                timestamp: Date.now(),
                thumbnail: {
                    url: song.thumbnail
                },
                author: {
                    name: "Added to Queue",
                    icon_url: `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`
                },
                fields: [
                    { name: "Channel", value: song.author.name, inline: true },
                    { name: "Duration", value: song.timestamp, inline: true }
                ]
            }
        })
        logger(bot, "song.enqueue", msg.member, `Adding song ${song.title} to ${msg.guild.name} queue`)
    }
}

export const playSong = async (bot: Client, msg: Message, song: Song) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!song) return cleanupQueue(bot, msg);
    if (!queue) queue = await createQueue(bot, msg, song);
    ytdl(song.url, { filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 2 }).then(stream => {
        const dispatcher = queue.connection.play(stream, { type: "opus", highWaterMark: 1 });
        dispatcher.setVolumeLogarithmic(queue.volume);
        dispatcher.on("finish", () => {
            queue.songs.shift();
            playSong(bot, msg, queue.songs[0]);
        })
        dispatcher.on("start", () => {
            logger(bot, "song.play", null, `Playing song ${song.title}`)
            queue.textChannel.send({
                embed: {
                    title: song.title,
                    url: song.url,
                    timestamp: Date.now(),
                    thumbnail: {
                        url: song.thumbnail
                    },
                    author: {
                        name: "Now Playing",
                        icon_url: `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`
                    },
                    fields: [
                        { name: "Channel", value: song.author.name, inline: true },
                        { name: "Duration", value: song.timestamp, inline: true }
                    ]
                }
            })
        })
        dispatcher.on("error", (error) => {
            logger(bot, "song.play", null, error);
            queue.connection.disconnect();
        });
    });
}

export const stopSong = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue || !queue.connection) {
        return msg.channel.send("There's no song playing for your current channel.");
    }
    else {
        logger(bot, "song.stop", msg.member);
        if (queue.connection && queue.connection.dispatcher)
            queue.connection.dispatcher.end();
    }
}

export const skipSong = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song playing for your current channel.");
    } else {
        try {
            const song = queue.songs[0];
            if (song !== undefined) {
                logger(bot, "song.skip", msg.member, `Skipping song ${song.title}`)
                queue.songs.shift();
                playSong(bot, msg, queue.songs[0]);
            } else {
                cleanupQueue(bot, msg)
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
        return msg.channel.send("There's no song to be paused.");
    }
    if (queue.connection && queue.connection.dispatcher)
        queue.connection.dispatcher.pause();
}

export const resume = async (bot: Client, msg: Message) => {
    let queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("There's no song to be resumed.");
    }
    logger(bot, "song.resume", msg.member, `Resuming song ${queue.songs[0]}`)
    if (queue.connection && queue.connection.dispatcher)
        queue.connection.dispatcher.resume();
}

export const volume = async (bot: Client, msg: Message) => {
    const queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("The bot needs to be playing to adjust the volume");
    }
    try {
        const volume = Number(msg.content.split(" ")[1]) / 10;
        if (volume < 0 || volume > 10) throw new Error("Invalid number");
        queue.connection.dispatcher.setVolume(volume)
        queue.volume = volume;
        serverQueues.set(msg.guild.id, queue);
        logger(bot, "song.volume", msg.member, `Setting volume to ${volume}`)
    }
    catch (err) {
        msg.channel.send("The volume should be an integer between 0 and 10. e.g.: !vol 5")
    }
}

const cleanupQueue = async (bot: Client, msg: Message) => {
    const queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("Sorry, there's no queue to be cleaned.");
    }
    if (queue.connection && queue.connection.dispatcher) {
        queue.connection.dispatcher.end();
        queue.connection.channel.leave();
    }
    serverQueues.delete(msg.guild.id);
}

const createQueue = async (bot: Client, msg: Message, song: Song) => {
    const voice = await msg.member.voice.channel.join();
    let queue = new ChannelQueue(msg.channel, msg.member.voice.channelID, voice);
    queue.songs.push(song);
    serverQueues.set(msg.guild.id, queue);
    return queue;
}