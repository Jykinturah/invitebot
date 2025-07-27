'use strict';
const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
module.exports = {

    // Check if a user has a role within the config.modID list
    isUserMod: async (user, guild) => {
        if (!guild.available) return false;
        return guild.members.cache.get(user.id).roles.cache.hasAny(config.modID);
    },

    // WIP logging of invitations
    inviteLog: async (client, message) => {
        if (config.logID) return client.channels.cache.get(config.logID).send(message);
    },

    // Generate Button Embed
    generateEmbed: async (modmailThreadID, modmailBody, modmailAuthor, modmailSubject) => {

        // If body is longer than 1000 characters, trim
        if (modmailBody.length > 1000) modmailBody = modmailBody.slice(0, 1000) + '... [Continued]';

        // Generate Discord Embed
        const inviteEmbed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(modmailSubject)
            .addFields({ name: 'Message', value: modmailBody }, { name: 'Author', value: modmailAuthor, inline: true }, { name: 'Profile', value: `[Go to Overview](https://www.reddit.com/user/${modmailAuthor}) ➡`, inline: true }, { name: 'Thread ID', value: modmailThreadID, inline: true })
            .addFields({ name: 'Link', value: `[Go to Thread](https://mod.reddit.com/mail/all/${modmailThreadID}) ➡`, inline: true }, { name: 'Responses', value: `✅ Accept | 👨 Man | ℹ Request Info | 🔄 Resend Invite \n 🔥 Archive | ❓ Second Opinion` });
        // Generate Discord Buttons
        const inviteButton = new ButtonBuilder()
            .setCustomId('invite')
            .setLabel('Invite')
            .setStyle(ButtonStyle.Success);
        const reinviteButton = new ButtonBuilder()
            .setCustomId('reinvite')
            .setLabel('Re-invite')
            .setStyle(ButtonStyle.Success);
        const requestSocialButton = new ButtonBuilder()
            .setCustomId('requestSocials')
            .setLabel('Request Socials')
            .setStyle(ButtonStyle.Primary)
        const secondOpinionButton = new ButtonBuilder()
            .setCustomId('secondOpinion')
            .setLabel('2nd Opinion')
            .setStyle(ButtonStyle.Secondary)
        const manRejectButton = new ButtonBuilder()
            .setCustomId('manReject')
            .setLabel('Man')
            .setStyle(ButtonStyle.Danger);
        const dismissButton = new ButtonBuilder()
            .setCustomId('archive')
            .setLabel('Dismiss')
            .setStyle(ButtonStyle.Danger);

        // Generate Interaction Rows
        const buttonRow1 = new ActionRowBuilder().addComponents(inviteButton, reinviteButton, requestSocialButton, secondOpinionButton);
        const buttonRow2 = new ActionRowBuilder().addComponents(manRejectButton, dismissButton);

        // Return Invite Card Object with Embeds and Interaction Rows
        return { embeds: [inviteEmbed], components: [buttonRow1, buttonRow2] }
    },
};