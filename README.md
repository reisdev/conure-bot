# Conure Bot

Discord bot built with Typescript and Discord.js.

## How to

### Install

To install the packages, run:

```bash
$ npm install
```

### Use

To get the bot running for development, execute the script `dev`:

```bash
npm run dev
```

### Commands

Available commands:

**Basic:**

```md
!hello : Receive greetings from the bot
!since : Discover how long you've been here
!ping : Pong!
!help | !commands: List the available commands
```

**Music:**

```md
!p <song name or url> : Search and play the song
!stop : Stop all playing songs
!skip : Skip the current song
!pause : pause the current song
!resume : resume the current song
```

**Admin commands:**

```md
!cleanup: Clean up all the chat messages;
!getout: Turn off the bot
!log: console.log the msg
!rs or !restart: Restart the bot service
!rollback: Delete all the commands call and bot messages
!vol or !vol <integer 0-10> : Set the song volume
```
