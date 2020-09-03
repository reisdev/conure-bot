import { VoiceState } from 'discord.js';
import { DiscordBot } from '..';
import { cleanupQueue } from '../utils/music';

export default (bot: DiscordBot, oldState: VoiceState, state: VoiceState) => {
    if (state.member.id === bot.user.id && !state.connection) {
        const queue = bot.queues.get(state.guild.id);
        if (queue) {
            bot.logger("bot.disconnected", null, "The bot has been disconnected manually");
            cleanupQueue(bot, null, state.guild.id);
        }
    }
}