import { VoiceConnection, Message, Client, TextChannel, VoiceChannel } from "discord.js"

import ytdl from 'ytdl-core-discord';
import yts from "yt-search";
import logger from "./logger";

class ChannelQueue {
    textChannel: TextChannel = null;
    voiceChannel: string = null;
    connection: VoiceConnection = null;
    songs: Array<Song>;
    volume: number = 0.5;
    playing: Boolean = true;
    constructor(text: TextChannel, voice: string, conn: VoiceConnection) {
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
            return msg.channel.send(`You need to join the channel to play a song.`);
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
        if (msg.member.voice.channel.id !== channel.id) {
            return msg.channel.send(`You need to join the voice channel <#${channel.id}> to hear the song.`);
        }
        queue.songs.push(song);
        queue.textChannel.send({
            embed: {
                title: song.title,
                description: `**Channel:** ${song.author.name} **|** **Duration:** ${song.timestamp} **|** **Position:** ${queue.songs.length}`,
                url: song.url,
                timestamp: Date.now(),
                thumbnail: {
                    url: song.thumbnail
                },
                author: {
                    name: "Added to Queue",
                    icon_url: `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`
                }
            }
        })
        logger(bot, "song.enqueue", msg.member, `Adding song ${song.title} to ${msg.guild.name} queue`)
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
    if (queue.connection && queue.connection.dispatcher) {
        logger(bot, "song.resume", msg.member, `Resuming song ${queue.songs[0].title}`)
        queue.connection.dispatcher.resume();
    }
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

export const leave = async (bot: Client, msg: Message) => {
    const queue = serverQueues.get(msg.guild.id)
    if (!queue) return msg.channel.send("Sorry, there's not channel to leave");
    queue.connection.disconnect()
}

export const searchSong = async (bot: Client, msg: Message, content: string) => {
    if (!content || content.length === 0) {
        const queue = serverQueues.get(msg.guild.id);
        if (queue && queue.connection && queue.connection.player) {
            if (queue.connection.player["voiceConnection"]["status"] === 0) return resume(bot, msg);
        }
    }
    else if (content.startsWith("http")) {
        ytdl.getInfo(content).then((r) => {
            const song = new Song();
            song.title = r.title;
            song.url = r.video_url;
            song.videoId = r.video_id;
            song.seconds = Number(r.length_seconds);
            song.description = r.description;
            song.author = {
                id: r.author.id,
                url: r.author.user_url,
                channelId: r.author.id,
                name: r.author.name,
                channelUrl: r.author.channel_url,
                userId: r.author.id,
                userUrl: r.author.user_url,
                userName: r.author.user,
                channelName: r.author.user
            }
            execute(bot, msg, song)
        })
    }
    else {
        msg.channel.send(`:mag_right: Searching for **${content}** on YouTube`)
        yts(content, async (err, r) => {
            if (err) {
                msg.channel.send("Sorry, I had a problem to search your music! Trying again later...")
                return logger(bot, "song.play", msg.member, err)
            }
            if (r.videos.length > 0) {
                let song: Song = r.videos.shift();
                execute(bot, msg, song);
            }
            else {
                msg.channel.send("Sorry, I couldn't find the song that you asked.")
            }
        })
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
                    description: `**Channel:** ${song.author.name} **|** **Duration:** ${song.timestamp} **|** **Position:** ${queue.songs.length}`,
                    url: song.url,
                    timestamp: Date.now(),
                    thumbnail: {
                        url: song.thumbnail
                    },
                    author: {
                        name: "Now Playing",
                        icon_url: `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`
                    }
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

export const emptyQueue = async (bot: Client, msg: Message) => {
    const queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("Sorry, there's no queue to be cleaned.");
    }
    const removed = queue.songs.length - 1;
    queue.songs = queue.songs.slice(1, queue.songs.length - 1);
    serverQueues.set(msg.guild.id, queue);
    return msg.channel.send(`${removed} song${removed > 1 ? 's' : ''} removed from the queue`);
}

const createQueue = async (bot: Client, msg: Message, song: Song) => {
    const voice = await msg.member.voice.channel.join();
    let queue = new ChannelQueue(msg.channel as TextChannel, msg.member.voice.channelID, voice);
    queue.songs.push(song);
    serverQueues.set(msg.guild.id, queue);
    return queue;
}

const cleanupQueue = async (bot: Client, msg: Message) => {
    const queue = serverQueues.get(msg.guild.id);
    if (!queue) {
        return msg.channel.send("Sorry, there's no queue to be cleaned.");
    }
    if (queue.connection) queue.connection.disconnect()
    serverQueues.delete(msg.guild.id);
}