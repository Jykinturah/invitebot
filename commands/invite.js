'use strict';

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDescription('Manually create invites'),
    async execute(interaction) {
        let channel = client.channels.cache.get(config.inviteID);
        channel.createInvite({ maxUses: 1, unique: true }).then(invite => {
            interaction.reply({ 
                content: `\`https://discord.gg/${invite.code}\``, 
                ephemeral: true 
            });
        });
	}
};