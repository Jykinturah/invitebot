const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // If it's not a button, ignore it.
        if (!interaction.isButton()) return;

        /** Invite Embed Interaction Logic */
        // If the interaction is not in the #invite channel, ignore it.
        if (interaction.channelId === config.modmailID) {
    
            /** Fetch Data from Embed */
            let threadID = interaction.message.embeds[0].fields[2].value;
            let invAuthor = interaction.message.embeds[0].fields[1].value
            let channel = client.channels.cache.get(config.inviteID);
            let logID = false; //Replace with Log Channel ID
    
            if (interaction.customId === 'invite') {
                await interaction.reply({
                    content: `Invited ${invAuthor}.`,
                    ephemeral: true
                });
                channel.createInvite({
                    maxUses: 1,
                    unique: true
                }).then(invite => {
                    sendModMail(threadID, `Hi! \n\nThanks for applying to join the r/GirlGamers Discord \n\n*Link expires in 24 hours; feel free to ask for another if needed* \n\nhttps://discord.gg/${invite.code}`);
                });
                if (logID) client.channels.cache.get(logID).send(`✅ Invited Reddit User ${invAuthor} and archived Thread ID ${threadID}.`);
                interaction.message.delete();
            };
    
            if (interaction.customId === 'reinvite') {
                await interaction.reply({
                    content: `Re-invited ${invAuthor}.`,
                    ephemeral: true
                });
                channel.createInvite({
                    maxUses: 1,
                    unique: true
                }).then(invite => {
                    sendModMail(threadID, `Here's another invite \n\nhttps://discord.gg/${invite.code}`);
                });
                if (logID) client.channels.cache.get(logID).send(`🔄 Re-invited Reddit User ${invAuthor} and archived Thread ID ${threadID}.`);
                interaction.message.delete();
            };
    
            if (interaction.customId === 'requestSocials') {
                await interaction.reply({
                    content: `Requesting Socials from ${invAuthor}.`,
                    ephemeral: true
                });
                sendModMail(threadID, `Thanks for applying; however, due to your posting history we will need more information. \n\nDo you mind providing a link to a public text-based social media (not TikTok or Instagram) to verify? \n\nPlease note that we aren't looking for photo or voice verification, \nwe want to make sure we're inviting users that contribute to a positive and supportive environment.`);
                if (logID) client.channels.cache.get(logID).send(`ℹ Requested Socials from Reddit User ${invAuthor} and archived Thread ID ${threadID}.`);
                interaction.message.delete();
            };
    
            if (interaction.customId === 'secondOpinion') {
                await interaction.reply({
                    content: `Requesting Second Opinion.`,
                    ephemeral: true
                });
                let getInvite = interaction.message.embeds[0].spliceFields(5, 1);
                let inviteRow1 = new Discord.MessageActionRow().addComponents(
                    new Discord.MessageButton().setCustomId("invite").setLabel("Invite").setStyle('SUCCESS'),
                    new Discord.MessageButton().setCustomId("reinvite").setLabel("Re-invite").setStyle('SUCCESS'),
                    new Discord.MessageButton().setCustomId("requestSocials").setLabel("Request Socials").setStyle('PRIMARY')
                );
                let inviteRow2 = new Discord.MessageActionRow().addComponents(
                    new Discord.MessageButton().setCustomId("manReject").setLabel("Man").setStyle('DANGER'),
                    new Discord.MessageButton().setCustomId("archive").setLabel("Dismiss").setStyle('DANGER')
                );
                let inviteRow3 = new Discord.MessageActionRow().addComponents(
                    new Discord.MessageButton().setCustomId("secondOpinion").setLabel(`2nd Opinion Requested by ${interaction.member.user.tag}`).setStyle('DANGER').setDisabled(true)
                );
                if (logID) client.channels.cache.get(logID).send(`❓ Requested 2nd Opinion for ${invAuthor} and Thread ID ${threadID}.`);
                interaction.message.edit({
                    embeds: [getInvite],
                    components: [inviteRow1, inviteRow2, inviteRow3]
                });
                /* Create Thread? */
            };
    
            if (interaction.customId === 'manReject') {
                await interaction.reply({
                    content: `Rejecting ${invAuthor}.`,
                    ephemeral: true
                });
                sendModMail(threadID, 'Hi! \n\nThanks for applying; however, this is a female-identifying space so we will have to decline.');
                if (logID) client.channels.cache.get(logID).send(`👨 Rejected Reddit User ${invAuthor} and archived Thread ID ${threadID}.`);
                interaction.message.delete();
            };
    
            if (interaction.customId === 'archive') {
                await interaction.reply({
                    content: `Archiving ${threadID}.`,
                    ephemeral: true
                });
                r.getNewModmailConversation(threadID).archive();
                if (logID) client.channels.cache.get(logID).send(`🔥 Archiving Thread ID ${threadID}.`);
                interaction.message.delete();
            };
        };
    }
};