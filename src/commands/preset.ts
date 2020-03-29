const commands =
    `
Available commands:

**Basic**:
\`\`\`md
!hello : Receive greetings from the bot
!since : Discover how long you've been here
!ping : Pong!
!help | !commands: List the available commands
\`\`\`
**Music**:
\`\`\`md
!p <song name or url>? : Search and play the song or resume the last playing
!resume : resume the current song
!pause : pause the current song
!stop : Stop all playing songs
!skip : Skip the current song
!vol or !volume <integer 0-10>: Set the volume
!cleanup: Empty the songs queue
\`\`\`
`

const adminCommands = `**Admin commands**:
\`\`\`md
!getout: Turn off the bot
!log: console.log the msg
!rs or !restart: Restart the bot service
!rollback: Delete all the commands call and bot messages
\`\`\`
`

export default {
    commands,
    adminCommands
}