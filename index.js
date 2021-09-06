'use strict';
const { Discord, Intents } = require('discord.js');
const config = require('./config.json');
const snoowrap = require('snoowrap');

/** Intents are currently very permissive to guarantee functionality 
 * 
 * GUILDS
 * 	In my experience, bot won't work without this Intent.
 * GUILD_MEMBERS
 * 	Same as above.
 * GUILD_EMOJIS_AND_STICKERS
 * 	Emojis are used to capture reports and for the invite verification system.
 * GUILD_INTEGRATIONS
 * 	May not be needed but adding just in case.
 * GUILD_INVITES
 * 	Bot produces invite links.
 * GUILD_MESSAGES
 * 	Bot sends and checks embed messages, along with reported messages.
 * GUILD_MESSAGE_REACTIONS
 * 	Bot uses reactions for report system aned for the invite verifications system.
*/

const client = new Discord.Client({ 
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
		Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MESSAGES, 
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});

var intervalPrune = (config.intervalPrune * 1000);
var intervalModmail = (config.intervalModmail * 1000);

client.once('ready', () => {
	console.log('ready!');
});

client.on('ready', () => {
	Members();
	client.setInterval(pruneMembers, intervalPrune);
	getModmail();
	client.setInterval(getModmail, intervalModmail);
});

/** Prune Members of Server with 7 Days of Inactivity */
function pruneMembers() {
	let guild = client.guilds.cache.get(config.guildID);
	guild.members.prune({ days: 7 });
};

/** Reddit API Wrapper */
const r = new snoowrap({
	userAgent: 'invite-bot',
	clientId: config.clientId,
	clientSecret: config.clientSecret,
	refreshToken: config.refreshToken
});

/** Reddit API Mod Mail Check, for Invite Requests */
/* Note: May put some parameters here into config.json. */
function getModmail() {
	r.getSubreddit('GGDiscordInvites').getNewModmailConversations({limit: 1}).then(modmail => {
		if (modmail[0].messages[0].author.name.name === 'GirlGamersDiscord') return;
		const inviteEmbed = new Discord.MessageEmbed()
			.setColor(config.embedColor)
			.setTitle(modmail[0].subject)
			.addFields(
				{name: 'Message', value: modmail[0].messages[0].bodyMarkdown},
				{name: 'Author', value: modmail[0].messages[0].author.name.name, inline: true},
				{name: 'Profile', value: `[Go to Overview](https://www.reddit.com/user/${modmail[0].messages[0].author.name.name}) ➡`, inline: true},
				{name: 'Thread ID', value: modmail[0].id, inline: true},
			)
			.addFields(
				{name: 'Link', value: `[Go to Thread](https://mod.reddit.com/mail/all/${modmail[0].id}) ➡`, inline: true},
				{name: 'Responses', value: `✅ Accept | 👨 Man | ℹ Request Info | 🔄 Resend Invite \n 🔥 Archive | ❓ Second Opinion`}
			)
		/* Replace with Discord embed buttons */
		client.channels.cache.get(config.modmailID).send(inviteEmbed).then(embed => {
			embed.react('✅'),
			embed.react('👨'),
			embed.react('ℹ'),
			embed.react('🔄'),
			embed.react('🔥'),
			embed.react('❓')
		});
		r.getNewModmailConversation(modmail[0].id).archive();
	});
};

client.on('messageReactionAdd', async (reaction, user) => {
	/** Emoji Report Logic */
	if (reaction.emoji.id === config.emojiID) {
		reaction.remove();
		if (reaction.message.partial) await reaction.message.fetch();
		if (reaction.message.content.length > 0) {
			var message = reaction.message.content
		} else {
			var message = 'Embedded Content'
		}
		const reportEmbed = new Discord.MessageEmbed()
			.setColor(config.embedColor)
			.setTitle('User Report')
			.addFields(
				{name: 'Message', value: message},
				{name: 'Author', value: reaction.message.author.tag, inline: true},
				{name: 'Channel', value: `#${reaction.message.channel.name}`, inline: true},
				{name: 'Reported By', value: user.tag, inline: true},
			)
			.addFields(
				{name: 'Link', value: `[Go to Message](https://discordapp.com/channels/${config.guildID}/${reaction.message.channel.id}/${reaction.message.id}) ➡`, inline: true},
				{name: 'Response', value: '👍 Acknowledge', inline: true}
			)
		client.channels.cache.get(config.channelID).send('@here', reportEmbed).then(embed => {
			embed.react('👍')
		});
		user.send(config.message);
		return;
	};

	/** Report Acknowledgement Logic */
	if (reaction.emoji.name === '👍') {
		if (reaction.message.partial) await reaction.message.fetch();
		if (!reaction.message.author.bot) return;
		if (user.bot) return;
		if (!(reaction.message.embeds[0].fields[5].name === 'Response')) return;
		const getReport = reaction.message.embeds[0].spliceFields(5, 1);
		const reportEdit = new Discord.MessageEmbed(getReport)
			.addFields(
				{name: 'Acknowledged by', value: user.tag, inline: true}
			)
		reaction.message.edit(reportEdit);
		reaction.remove();
	};

	/** Invite Channel Reaction Logic */
	if (reaction.emoji.name === '✅') {
		if (reaction.message.partial) await reaction.message.fetch();
		if (!reaction.message.author.bot) return;
		if (user.bot) return;
		if (!(reaction.message.channel.id === config.modmailID)) return;
		let channel = client.channels.cache.get(config.inviteID);
		channel.createInvite({maxUses: 1, unique: true }).then(invite => {
			r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).reply(`Hi! \n\n Thanks for applying to join the r/GirlGamers Discord \n\n *Link expires in 24 hours; feel free to ask for another if needed* \n\n https://discord.gg/${invite.code}`)
				.then(() => r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).archive());
		});
		reaction.message.delete()
	};
	if (reaction.emoji.name === '👨') {
		if (reaction.message.partial) await reaction.message.fetch();
		if (!reaction.message.author.bot) return;
		if (user.bot) return;
		if (!(reaction.message.channel.id === config.modmailID)) return;
		r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).reply('Hi! \n\n Thanks for applying; however, this is a female-identifying space so we will have to decline.')
			.then(() => r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).archive());
		reaction.message.delete();
	};
	if (reaction.emoji.name === 'ℹ') {
		if (reaction.message.partial) await reaction.message.fetch();
		if (!reaction.message.author.bot) return;
		if (user.bot) return;
		if (!(reaction.message.channel.id === config.modmailID)) return;
		r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).reply(`Thanks for applying; however, due to your posting history we will need more information. \n\n Do you mind providing a link to a public text-based social media (not TikTok or Instagram) to verify? \n\n Please note that we aren't looking for photo or voice verification, \n we want to make sure we're inviting users that contribute to a positive and supportive environment.`)
			.then(() => r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).archive());
		reaction.message.delete();
	};
	if (reaction.emoji.name === '🔄') {
		if (reaction.message.partial) await reaction.message.fetch();
		if (!reaction.message.author.bot) return;
		if (user.bot) return;
		if (!(reaction.message.channel.id === config.modmailID)) return;
		let channel = client.channels.cache.get(config.inviteID);
		channel.createInvite({maxUses: 1, unique: true }).then(invite => {
			r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).reply(`Here's another invite \n\n https://discord.gg/${invite.code}`)
				.then(() => r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).archive());
		});
		reaction.message.delete();
	};
	if (reaction.emoji.name === '🔥') {
		if (reaction.message.partial) await reaction.message.fetch();
		if (!reaction.message.author.bot) return;
		if (user.bot) return;
		if (!(reaction.message.channel.id === config.modmailID)) return;
		r.getNewModmailConversation(reaction.message.embeds[0].fields[3].value).archive();
		reaction.message.delete();
	};
	if (reaction.emoji.name === '❓') {
		if (reaction.message.partial) await reaction.message.fetch();
		if (!reaction.message.author.bot) return;
		if (user.bot) return;
		if (!(reaction.message.channel.id === config.modmailID)) return;
		if (reaction.message.embeds[0].fields[5].name === 'Second Opinion By') return;
		const getInvite = reaction.message.embeds[0].spliceFields(5, 1);
		const inviteEdit = new Discord.MessageEmbed(getInvite)
			.addFields(
				{name: 'Second Opinion By', value: user.tag, inline: true},
				{name: 'Responses', value: '✅ Accept | 👨 Man | ℹ Request Info | 🔄 Resend Invite \n 🔥 Archive'}
			)
		reaction.message.edit(inviteEdit);
		reaction.remove();
	};
});

client.on('message', async (message) => {
	/** Ignore Logic */
	if (message.author.bot) return;
	if (message.guild === null) return;
	if (message.content.indexOf(config.prefix) !== 0) return;
	if (!message.member) return;
	if (!(message.member.roles.cache.has(config.modID) || message.member.roles.cache.has(config.communityID))) return;

	const args = message.content.slice(config.prefix.length).trim().split(/ +/)
	const command = args.shift().toLowerCase()

	/**  */
	if (command === 'invite') {
		if (!args.length) {
			return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		} else if (args[0] === 'link') {
			let channel = client.channels.cache.get(config.inviteID);
			channel.createInvite({ maxUses: 1, unique: true }).then(invite => {
				message.channel.send(`https://discord.gg/${invite.code}`)
			});
			return;
		} else if (args[0] === 'reply') {
			r.getNewModmailConversation(args[1]).reply(args.slice(2).join(' '))
				.then(() => r.getNewModmailConversation(args[1]).archive());
			message.react('🏐')
		};
	};

	if (command === 'shame') {
		if (!args.length) {
			return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		} else if (args[0] === 'add') {
			const member = message.guild.members.cache.get(args[1]);
			if (member.roles.cache.has(config.shameID)) {
				return message.channel.send(`That user already has **Cone of Shame**, ${message.author}!`);
			} else {
				const role = message.guild.roles.cache.get(config.shameID);
				member.roles.add(role);
				message.channel.send(`Applied **Cone of Shame** to ${member.user.tag}!`);
			};
		} else if (args[0] === 'remove') {
			const member = message.guild.members.cache.get(args[1]);
			if (!member.roles.cache.has(config.shameID)) {
				return message.channel.send(`That user does not have **Cone of Shame**, ${message.author}!`);
			} else {
				const role = message.guild.roles.cache.get(config.shameID);
				member.roles.remove(role);
				message.channel.send(`Removed **Cone of Shame** on ${member.user.tag}!`);
			};
		};
	};

	if (command === 'report') {
		if (!args.length) {
			return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		} else if (args[0] === 'create') {
			const member = message.guild.members.cache.get(args[1]);
			const cardEmbed = new Discord.MessageEmbed()
			.setColor(config.embedColor)
			.setTitle('Report Profile')
			.setDescription(`**Username:** ${member.user.tag}\n**ID:** ${member.user.id}`)
			.setThumbnail(member.user.avatarURL())
			client.channels.cache.get(config.reportID).send(cardEmbed);
		} else if (args[0] === 'add') {
			const chnl = client.channels.cache.get(config.reportID);
			const card = await chnl.messages.fetch(args[1]);
			if (!(card.channel.id === config.reportID)) return;
			if (!(card.embeds[0].title === 'Report Profile')) return;
			const getCard = card.embeds[0]
			const cardEdit = new Discord.MessageEmbed(getCard)
				.addFields(
					{name: message.author.tag, value: args.slice(2).join(' ')}
				)
			card.edit(cardEdit);
		} else if (args[0] === 'remove') {
			const chnl = client.channels.cache.get(config.reportID);
			const card = await chnl.messages.fetch(args[1]);
			if (!(card.channel.id === config.reportID)) return;
			if (!(card.embeds[0].title === 'Report Profile')) return;
			let field = args[2] - 1;
			const getCard = card.embeds[0].spliceFields(field, 1);
			const cardEdit = new Discord.MessageEmbed(getCard)
			card.edit(cardEdit);
		};
	};
});

client.login(config.token);
