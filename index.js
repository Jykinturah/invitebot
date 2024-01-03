'use strict';

/** Intents are currently more permissive than likely needed to guarantee functionality 
 * 
 * GatewayIntentBits.Guilds
 * 	In my experience, a bot won't work without this Intent.
 * GatewayIntentBits.GuildMessages
 * 	Bot sends and checks embed messages, along with reported messages.
 * GatewayIntentBits.GuildMessageReactions
 * 	Bot uses reactions for report system and for the invite verifications system.
 */
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions]
});

const { syncModmail } = require('./helpers/reddit.js');

var intervalModmail = (config.intervalModmail * 1000);

client.once('ready', () => {
    console.log('ready!');
});

client.on('ready', () => {
    // Query Reddit Modmail on client ready
    syncModmail(client);
    // Query Reddit Modmail every [intervalModmail] seconds
    setInterval(syncModmail, intervalModmail, client);
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args,client));
}

client.login(config.token);