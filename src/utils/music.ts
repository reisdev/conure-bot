import { VoiceConnection, Message, Client, TextChannel, VoiceChannel, ReactionCollector } from "discord.js"

import ytdl from 'ytdl-core-discord';
import yts from "yt-search";
import { DiscordBot } from "..";

import { default as resume } from "../commands/music/resume";
import { default as pause } from "../commands/music/pause";
import { default as stopSong } from "../commands/music/stop";

export class ChannelQueue {
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
    addedAt: Date;
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

export const execute = async (bot: DiscordBot, msg: Message, song) => {
    let queue = bot.queues.get(msg.guild.id);
    if (!song) {
        return cleanupQueue(bot, msg);
    }
    if (!queue) {
        try {
            createQueue(bot, msg, song).then((queue) => {
                playSong(bot, msg, song);
            })
        } catch (e) {
            msg.reply("Uh.. sorry, I had a problem! Can you try again? Please!")
        }
    }
    else {
        const channel: VoiceChannel = bot.channels.cache.get(queue.voiceChannel) as VoiceChannel;
        if (msg.member.voice.channel.id !== channel.id) {
            return msg.reply(`You need to join the voice channel <#${channel.id}> to hear the song.`);
        }
        queue.songs.push(song);
        queue.textChannel.send({
            embed: {
                title: song.title,
                fields: [
                    { name: "Channel", value: song.author.name, inline: true },
                    { name: "Duration", value: song.timestamp, inline: true },
                    { name: 'Position in Queue', value: queue.songs.length, inline: true }
                ],
                url: song.url,
                timestamp: Date.now(),
                thumbnail: {
                    url: song.thumbnail
                },
                author: {
                    name: "Added to Queue",
                    icon_url: "https://cdn.discordapp.com/" + (bot.user.avatar !== null ? `avatars/${bot.user.id}/${bot.user.avatar}.png` : `embed/avatars/${Number(bot.user.discriminator) % 5}.png `)
                }
            }
        })
        bot.logger("song.enqueue", msg.member, `Adding song ${song.title} to ${msg.guild.name} queue`)
    }
}

export const volume = async (bot: DiscordBot, msg: Message, vol: number) => {
    const queue = bot.queues.get(msg.guild.id);
    if (!queue) {
        return msg.reply("the bot needs to be playing a song to adjust the volume");
    }
    try {
        const volume = vol / 10;
        if (volume < 0 || volume > 10) throw new Error("Invalid number");
        queue.connection.dispatcher.setVolume(volume)
        queue.volume = volume;
        bot.queues.set(msg.guild.id, queue);
        bot.logger("song.volume", msg.member, `Setting volume to ${volume}`)
    }
    catch (err) {
        msg.reply("the volume should be an integer between 0 and 10. e.g.: !vol 5")
    }
}

export const leave = async (bot: DiscordBot, msg: Message) => {
    const queue = bot.queues.get(msg.guild.id)
    if (!queue) return msg.reply("Sorry, there's not channel to leave");
    queue.connection.disconnect()
    cleanupQueue(bot, msg);
}

export const searchSong = async (bot: DiscordBot, msg: Message, content: string) => {
    if (!msg.member.voice.channel) {
        return msg.reply(`You need to join the channel to play a song.`);
    }
    else if (!content || content.length === 0) {
        const queue = bot.queues.get(msg.guild.id);
        if (queue && queue.connection && queue.connection.player) {
            if (queue.connection.player["voiceConnection"]["status"] === 0) return resume.execute(bot, msg);
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
        msg.reply(`:mag_right: Searching for **${content}** on YouTube`)
        yts(content, async (err, r) => {
            if (err) {
                msg.reply("Sorry, I had a problem to search your music! Trying again later...")
                return bot.logger("song.play", msg.member, err)
            }
            if (r.videos.length > 0) {
                let song: Song = r.videos.shift();
                if (!song || !song.url) throw Error("Song not found");
                song.addedAt = new Date();
                execute(bot, msg, song);
            }
            else {
                msg.reply("Sorry, I couldn't find the song that you asked.")
            }
        })
    }
}

export const playSong = async (bot: DiscordBot, msg: Message, song: Song) => {
    let queue = bot.queues.get(msg.guild.id);
    if (!song) return cleanupQueue(bot, msg);
    if (!queue) queue = await createQueue(bot, msg, song);

    try {
        const dispatcher = queue.connection.play(await ytdl(song.url, { filter: "audioonly", quality: "highestaudio" }), { type: "opus", highWaterMark: 1 << 15 });
        dispatcher.setVolumeLogarithmic(queue.volume);
        let playCollector: ReactionCollector;
        let pauseCollector: ReactionCollector;
        let stopCollector: ReactionCollector;
        dispatcher.on("finish", () => {
            queue.songs.shift();
            playCollector.stop();
            pauseCollector.stop();
            stopCollector.stop();
            playSong(bot, msg, queue.songs[0]);
        })
        dispatcher.on("debug", (debug) => {
            bot.logger("song.debug", null, debug);
        });
        dispatcher.on("start", () => {
            bot.logger("song.play", null, `Playing song ${song.title}`)
            queue.textChannel.send({
                embed: {
                    title: song.title,
                    fields: [
                        { name: "Channel", value: song.author.name, inline: true },
                        { name: "Duration", value: song.timestamp, inline: true },
                    ],
                    url: song.url,
                    timestamp: Date.now(),
                    thumbnail: {
                        url: song.thumbnail
                    },
                    author: {
                        name: "Now Playing",
                        icon_url: "https://cdn.discordapp.com/" + (bot.user.avatar !== null ? `avatars/${bot.user.id}/${bot.user.avatar}.png` : `embed/avatars/${Number(bot.user.discriminator) % 5}.png `)
                    }
                }
            }).then((embed: Message) => {
                playCollector = embed.createReactionCollector((reaction, user) => reaction.emoji.name === "▶️" && !user.bot);
                playCollector.on("collect", () => resume.execute(bot, msg))
                playCollector.on("dispose", () => resume.execute(bot, msg))
                embed.react("▶️");

                pauseCollector = embed.createReactionCollector((reaction, user) => reaction.emoji.name === "⏸️" && !user.bot);
                pauseCollector.on("collect", () => pause.execute(bot, msg))
                pauseCollector.on("dispose", () => pause.execute(bot, msg))
                embed.react("⏸️");

                stopCollector = embed.createReactionCollector((reaction, user) => reaction.emoji.name === "⏹️" && !user.bot);
                stopCollector.on("collect", () => stopSong.execute(bot, msg))
                stopCollector.on("dispose", () => stopSong.execute(bot, msg))
                embed.react("⏹️");

            })
        })
        dispatcher.on("error", (error) => {
            bot.logger("song.play", null, error);
            queue.connection.disconnect();
            bot.queues.delete(msg.guild.id);
        });
    } catch (e) {
        bot.logger("song.play", null, e);
        queue.connection
    }
}

export const emptyQueue = async (bot: DiscordBot, msg: Message) => {
    const queue = bot.queues.get(msg.guild.id);
    if (!queue) {
        return msg.reply("Sorry, there's no queue to be cleaned.");
    }
    const removed = queue.songs.length - 1;
    queue.songs = queue.songs.slice(1, queue.songs.length - 1);
    bot.queues.set(msg.guild.id, queue);
    return msg.reply(`${removed} song${removed > 1 ? 's' : ''} removed from the queue`);
}

export const createQueue = async (bot: DiscordBot, msg: Message, song: Song) => {
    const voice = await msg.member.voice.channel.join();
    let queue = new ChannelQueue(msg.channel as TextChannel, msg.member.voice.channelID, voice);
    queue.songs.push(song);
    bot.queues.set(msg.guild.id, queue);
    return queue;
}

export const cleanupQueue = async (bot: DiscordBot, msg: Message) => {
    const queue = bot.queues.get(msg.guild.id);
    if (!queue) {
        return msg.reply("Sorry, there's no queue to be cleaned.");
    }
    if (queue.connection) queue.connection.disconnect()
    bot.logger("queue.end")
    bot.queues.delete(msg.guild.id);
}
