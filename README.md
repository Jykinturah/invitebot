# Invite Bot

Discord bot for managing invite requests from Reddit Modmail

## Warning

- This bot uses `snoowrap` which has been deprecated for a while and uses vulnerable libraries, use at your own risk
  - As the bot only reads Modmail it is possible these vulnerabilities will never be a problem, but the risk still exists.
- If using a previous version of Invite Bot, invite embeds using reactions will likely not function reliably anymore, this is related to the way discordjs accesses the message cache, if an embed message is not cached, the `MessageReactionAdd` event will not reliably fire correctly. There is a command that was added to this bot to allow converting any Modmail Thread ID to the new embed with buttons.

## Installation

- Create a discord bot here: https://discord.com/developers/applications
- `git clone https://github.com/Jykinturah/invitebot`
- `cd invitebot`
- `npm install` to install Node modules
- `cp config.json.sample config.json`
- Edit the `config.json` file to fill in relevant information.
- Deploy new commands using `node deploy_commands.js` (required)
- Start the bot with `node index.js`
- The bot is now running.

## Using PM2

- Install PM2: https://pm2.keymetrics.io/docs/usage/quick-start/
  - `npm install pm2@latest -g`
- `pm2 startup`
- Follow the onscreen instructions to enable pm2 autostart on reboot.
- `pm2 start ecosystem.config.js`
- `pm2 status`, and confirm `InviteBot` is running

## How it works

Invite Bot will use the configured Reddit credentials to check for Reddit Mod Mail at the target subreddit. It will then generate entries in the configured Discord Server Channel using Reddit's Thread ID as a record to keep track of entries it has posted to allow for reading requests for Discord invites.

- `/invite` 
  - Generates an invite link that can be copied
- `/reply`
  - Replies to a Modmail Thread ID with a message
- `/convert`
  - Converts a Modmail Thread ID to the new Button Interaction Embed