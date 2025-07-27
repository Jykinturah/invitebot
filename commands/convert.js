'use strict';

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { convertModMail } = require('../helpers/reddit.js');
const { isUserMod } = require('../helpers/utilities.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convert')
        .setDMPermission(false)
        .setDescription('Convert Invite Embed (Moderator Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addStringOption(option =>
            option.setName('threadid')
                .setDescription('ModMail Thread ID')
                .setRequired(true),
        ),
    async execute(interaction) {

        // Check if user has mod role
        if (!isUserMod(interaction.user, interaction.guild)) {
            await interaction.reply({
                content: 'Only Moderators can access this command.',
                flags: MessageFlags.Ephemeral,
            });
        } else {

            // Verify ThreadID length just in case
            const modmailThreadID = interaction.options.getString('threadid');
            if (modmailThreadID.length < 5 || modmailThreadID.length > 7) {
                await interaction.reply({
                    content: 'Thread ID seems to be the wrong length, please check it!',
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await convertModMail(modmailThreadID, interaction)
            }
        }
    },
}