'use strict';

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { isUserMod } = require('../helpers/utilities.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDMPermission(false)
        .setDescription('Manually create invites (Moderator Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {

        // Check if user has mod role
        if (!isUserMod(interaction.user, interaction.guild)) {
            await interaction.reply({
                content: 'Only Moderators can access this command.',
                flags: MessageFlags.Ephemeral,
            });
        } else {

            // Generate an invite link for the Invite Channel
            const channel = interaction.client.channels.cache.get(config.inviteID);
            channel.createInvite({ maxUses: 1, unique: true }).then(invite => {
                interaction.reply({
                    content: `\`https://discord.gg/${invite.code}\``,
                    flags: MessageFlags.Ephemeral,
                });
            });
        }
    },
};