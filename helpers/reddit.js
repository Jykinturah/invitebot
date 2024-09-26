'use strict';

/** Reddit API Mod Mail Check, for Invite Requests */
const snoowrap = require('snoowrap');
const config = require('../config.json');
const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');

/** Reddit API Wrapper */
const r = new snoowrap({
	userAgent: 'invite-bot',
	clientId: config.clientId,
	clientSecret: config.clientSecret,
	refreshToken: config.refreshToken
});

module.exports = {
    syncModmail: async (client) => {
        r.getSubreddit( config.subReddit || 'GGDiscordInvites' ) // Target Subreddit (defaults to GGDiscordInvites if 'config.subReddit' isn't set)
        .getNewModmailConversations({limit: 10}) // Read 10 Modmail Conversations that are not archived
        .then(modmailConversations => {
            // If there are no Modmail Conversations that are not archived, exit
            if (modmailConversations.length < 1) return;
    
            // forEach to iterate through all Modmail Conversations
            modmailConversations.forEach(modmail => {
    
                // If there are no messages, exit this iteration
                if (modmail.messages === undefined ) return;
    
                // Thread ID used to link to Modmail and later Archive
                let modmailThreadID = modmail.id 
    
                // Fetch the entire Modmail Conversation
                r.getNewModmailConversation(modmail.id).fetch().then(fetchedModmail => {
    
                    // Human readable variable names
                    let modmailBody = fetchedModmail.messages[0].bodyMarkdown
                    let modmailAuthor = fetchedModmail.messages[0].author.name.name
                    let modmailSubject = fetchedModmail.subject
                    
                    // If body is longer than 1000 characters, trim
                    if (modmailBody.length > 1000) modmailBody = modmailBody.slice(0,1000) + '... [Continued]';
                    
                    // Generate Discord Embed
                    const inviteEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setTitle(modmailSubject)
                        .addFields(
                            {name: 'Message', value: modmailBody},
                            {name: 'Author', value: modmailAuthor, inline: true},
                            {name: 'Profile', value: `[Go to Overview](https://www.reddit.com/user/${modmailAuthor}) ➡`, inline: true},
                            {name: 'Thread ID', value: modmailThreadID, inline: true},
                        )
                        .addFields(
                            {name: 'Link', value: `[Go to Thread](https://mod.reddit.com/mail/all/${modmailThreadID}) ➡`, inline: true},
                            {name: 'Responses', value: `✅ Accept | 👨 Man | ℹ Request Info | 🔄 Resend Invite \n 🔥 Archive | ❓ Second Opinion`}
                        );
                    
                    // Generate Discord Buttons
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
                    
                    const secondOpinionButton =  new ButtonBuilder()
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
                    const buttonRow1 = new ActionRowBuilder().addComponents(inviteButton,reinviteButton,requestSocialButton,secondOpinionButton);
                    const buttonRow2 = new ActionRowBuilder().addComponents(manRejectButton,dismissButton);
    
                    // Send Invite Card with Embeds and Interaction Rows
                    client.channels.cache.get(config.modmailID).send(
                        { 
                            embeds: [inviteEmbed],
                            components: [buttonRow1,buttonRow2]
                        }
                    );
                    
                    // Send automatic Response and Archive Modmail Conversation
                    r.getNewModmailConversation(modmailThreadID)
                        .reply(`Hi there,\n\nThis is an automated message letting you know your message has been received.` +
                            `\n\nPlease be aware that we sometimes receive hundreds of applications per week, and our moderation ` +
                            `team is all volunteers, so it may take some time to respond. We appreciate your patience.`, true, false)
                        .then(() => {
                            r.getNewModmailConversation(modmailThreadID).archive().then(() => {
                                console.log(`Autoreplied and Archived Thread ID: ${modmailThreadID}`)
                            });
                        });
                });
            });
        }).catch(err => console.log(err));
    },
    
    // For Invite
    sendModmailInvite: async (user, threadID, inviteCode) => {
        const replyString = `Hi! \n\nThanks for applying to join the r/GirlGamers Discord\n\n` +
                            `*Link expires in 24 hours; feel free to ask for another if needed*\n\n` +
                            `https://discord.gg/${inviteCode}`;

        const modNote =     `Invite issued by ${user.tag}`;

        sendModmail(threadID,replyString,modNote);
    },

    // For Re-invite
    sendModmailReinvite: async (user, threadID, inviteCode) => {
        const replyString = `Here's another invite \n\nhttps://discord.gg/${inviteCode}`;

        const modNote =     `Re-invite issued by ${user.tag}`;

        sendModmail(threadID,replyString,modNote);
    },

    // For requesting info or socials
    sendModmailRequestSocials: async (user, threadID) => { 
        const replyString = `Thanks for applying; however, due to your posting history we will need more information.\n\n` +
                            `Do you mind providing a link to a public text-based social media (not TikTok or Instagram) to verify?\n\n` +
                            `Please note that we aren't looking for photo or voice verification,\n` +
                            `we want to make sure we're inviting users that contribute to a positive and supportive environment.`;

        const modNote =     `Info requested by ${user.tag}`;

        sendModmail(threadID,replyString,modNote);
    },

    // For rejecting men
    sendModmailRejectMan: async (user, threadID) => {
        const replyString = 'Hi! \n\n Thanks for applying; however, this is a female-identifying space so we will have to decline.';

        const modNote =     `Denied by ${user.tag}`;

        sendModmail(threadID,replyString,modNote);
    },

    // For archiving an invite post
    sendModmailArchive: async (user, threadID) => {
        const modNote = `Archived by ${user.tag}`;
        sendModNote(threadID,modNote);
    },

    sendModMailReply: async (user, threadID, replyMessage, interaction) => {
        const modNote = `Reply command sent by ${user.tag}`;

        await sendModMail(threadID,replyMessage,modNote);
        await interaction.reply({
            content: `Reply sent to ${threadID}`,
            ephemeral: true
        });
    }
}

const sendModmail = async function (threadID, replyString, modNote) {
    r.getNewModmailConversation(threadID).reply(replyString,'true','false').then(() =>
        r.getNewModmailConversation(threadID).reply(modNote,'false','true').then(() => archiveModMail(threadID))
    ).catch(err => console.log(err))
}

const sendModNote = async function (threadID, modNote) {
    r.getNewModmailConversation(threadID).reply(modNote,'false','true').then(() => archiveModMail(threadID)).catch(err => console.log(err));
}

const archiveModMail = async function (threadID) {
    r.getNewModmailConversation(threadID).archive().catch(err => console.log(err));
}