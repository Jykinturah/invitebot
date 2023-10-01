const { SlashCommandBuilder } = require('discord.js');
const { sendModMail } = require('../helpers/reddit.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
        .setDMPermission(false)
        .addSubcommand(subcommand => {
            subcommand
                .setName('link')
                .setDescription('Generate an Invite Link')
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName('reply')
                .setDescription('Send Invite Reply to ModMail Thread ID')
                .addStringOption(option => {
                    option
                        .setName('threadID')
                        .setDescription('ModMail Thread ID')
            })
        }),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'link') {
            let channel = client.channels.cache.get(config.inviteID);
            channel.createInvite({ maxUses: 1, unique: true }).then(invite => {
				interaction.reply({ content: `\`https://discord.gg/${invite.code}\``, ephemeral: true });
			});
        } else if (interaction.options.getSubcommand() === 'reply') {

		}
	}
};