'use strict';

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModMailReply } = require('../helpers/reddit.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reply')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDescription('Send Reply to ModMail Thread ID')
        .addStringOption(option =>
            option.setName('threadid')
                .setDescription('ModMail Thread ID')
                .setRequired(true)
            )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Reply Message')
                .setRequired(true)
            ),
    async execute(interaction) {
        const modmailThreadID = interaction.options.getString('threadid');
        if (modmailThreadID.length < 5 || modmailThreadID.length > 7) {
            await interaction.reply({
                content: 'Thread ID seems to be the wrong length, please check it!',
                ephemeral: true
            });
        } else {
            const modmailReplyMessage = interaction.options.getString('message');
            if (modmailReplyMessage.length > 0) {
                await sendModMailReply(interaction.user, modmailThreadID, modmailReplyMessage, interaction)
            } else {
                await interaction.reply({
                    content: 'There seems to be an error with the message, please check it!',
                    ephemeral: true
                });
            }
        }
	}
};