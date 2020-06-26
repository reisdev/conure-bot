import TwitchClient from 'twitch';

const token = TwitchClient.getAccessToken(
    process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET, "")

const twitchClient = TwitchClient.withCredentials(
    process.env.TWITCH_CLIENT_ID, process.env.TWITCH_ACCESS_TOKEN)