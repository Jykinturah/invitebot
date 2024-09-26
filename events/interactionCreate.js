'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { inviteLog } = require('../helpers/log');
const { sendModmailInvite, sendModmailRejectMan, sendModmailRequestSocials, sendModmailReinvite, sendModmailArchive } = require("../helpers/reddit");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // If it's not a button, ignore it.
        if (!interaction.isButton()) return;

        /** Invite Embed Interaction Logic */
        // If the interaction is not in the #invite channel, ignore it.
        if (interaction.channelId === config.modmailID) {
    
            /** Fetch Data from Embed */
            const threadID = interaction.message.embeds[0].fields[3].value;
            const invAuthor = interaction.message.embeds[0].fields[1].value;
            const client = interaction.client;
            const channel = client.channels.cache.get(config.inviteID);
            const user = interaction.user;
    
            if (interaction.customId === 'invite') {
                await interaction.reply({
                    content: `Inviting ${invAuthor}.`,
                    ephemeral: true
                });

                channel.createInvite({ maxUses: 1, unique: true }).then(invite => {
                    sendModmailInvite(user,threadID,invite.code);
                });

                inviteLog(client, `✅ Invited Reddit User ${invAuthor} and archived Thread ID ${threadID}.`)

                interaction.message.delete();
            };
    
            if (interaction.customId === 'reinvite') {
                await interaction.reply({
                    content: `Re-inviting ${invAuthor}.`,
                    ephemeral: true
                });

                channel.createInvite({
                    maxUses: 1,
                    unique: true
                }).then(invite => {
                    sendModmailReinvite(user,threadID,invite.code);
                });

                inviteLog(client, `🔄 Re-invited Reddit User ${invAuthor} and archived Thread ID ${threadID}.`);

                interaction.message.delete();
            };
    
            if (interaction.customId === 'requestSocials') {
                await interaction.reply({
                    content: `Requesting Socials from ${invAuthor}.`,
                    ephemeral: true
                });

                sendModmailRequestSocials(user,threadID);

                inviteLog(client, `ℹ Requested Socials from Reddit User ${invAuthor} and archived Thread ID ${threadID}.`);

                interaction.message.delete();
            };
    
            if (interaction.customId === 'secondOpinion') {
                await interaction.reply({
                    content: `Requesting Second Opinion.`,
                    ephemeral: true
                });

                const getInvite = new EmbedBuilder(interaction.message.embeds[0]).spliceFields(5, 1);

                const inviteButton = new ButtonBuilder()
                    .setCustomId('invite')
                    .setLabel('Invite')
                    .setStyle(ButtonStyle.Success);
                
                const reinviteButton =  new ButtonBuilder()
                    .setCustomId('reinvite')
                    .setLabel('Re-invite')
                    .setStyle(ButtonStyle.Success);

                const requestSocialButton =  new ButtonBuilder()
                    .setCustomId('requestSocials')
                    .setLabel('Request Socials')
                    .setStyle(ButtonStyle.Primary)
                
                const manRejectButton = new ButtonBuilder()
                    .setCustomId('manReject')
                    .setLabel('Man')
                    .setStyle(ButtonStyle.Danger);
                
                const dismissButton = new ButtonBuilder()
                    .setCustomId('archive')
                    .setLabel('Dismiss')
                    .setStyle(ButtonStyle.Danger);
                
                const secondOpinionButton =  new ButtonBuilder()
                    .setCustomId("secondOpinion")
                    .setLabel(`2nd Opinion Requested by ${interaction.member.user.tag}`)
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)

                const buttonRow1 = new ActionRowBuilder().addComponents(inviteButton,reinviteButton,requestSocialButton);
                const buttonRow2 = new ActionRowBuilder().addComponents(manRejectButton,dismissButton);
                const buttonRow3 = new ActionRowBuilder().addComponents(secondOpinionButton);

                inviteLog(client, `❓ Requested 2nd Opinion for ${invAuthor} and Thread ID ${threadID}.`);

                interaction.message.edit({
                    embeds: [getInvite],
                    components: [buttonRow1, buttonRow2, buttonRow3]
                });
            };
    
            if (interaction.customId === 'manReject') {
                await interaction.reply({
                    content: `Rejecting ${invAuthor}.`,
                    ephemeral: true
                });

                sendModmailRejectMan(user,threadID);

                inviteLog(client, `👨 Rejected Reddit User ${invAuthor} and archived Thread ID ${threadID}.`);

                interaction.message.delete();
            };
    
            if (interaction.customId === 'archive') {
                await interaction.reply({
                    content: `Archiving ${threadID}.`,
                    ephemeral: true
                });

                sendModmailArchive(user,threadID);

                inviteLog(client, `🔥 Archiving Thread ID ${threadID}.`);

                interaction.message.delete();
            };
        };
    }
};