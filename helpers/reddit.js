'use strict';

/** Reddit API Mod Mail Check, for Invite Requests */
const snoowrap = require('snoowrap');
const config = require('../config.json');
const { MessageFlags } = require('discord.js');
const { generateEmbed } = require('../helpers/utilities.js');

/** Reddit API Wrapper */
const r = new snoowrap({
    userAgent: 'invite-bot',
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
});

module.exports = {
    syncModmail: async (client) => {
        let modmailThreadID

        async function processModmailConversations(modmailConversations) {
            // If there are no Modmail Conversations that are not archived, exit
            if (modmailConversations.length < 1) return;
            // forEach to iterate through all Modmail Conversations
            modmailConversations.forEach(processSingleModmail);
        }

        async function processSingleModmail(modmail) {
            // If there are no messages, exit this iteration
            if (modmail.messages === undefined) return;
            // Thread ID used to link to Modmail and later Archive
            modmailThreadID = modmail.id
            // Fetch the entire Modmail Conversation
            r.getNewModmailConversation(modmailThreadID).fetch().then(parseModmail)
        }

        async function parseModmail(fetchedModmail) {
            // Human readable variable names
            const modmailBody = fetchedModmail.messages[0].bodyMarkdown
            const modmailAuthor = fetchedModmail.messages[0].author.name.name
            const modmailSubject = fetchedModmail.subject
            // Generate Discord Embed, nested Promises
            generateEmbed(modmailThreadID, modmailBody, modmailAuthor, modmailSubject)
                .then(modmailEmbed => {
                    // Send Invite Card with Embeds and Interaction Rows
                    client.channels.cache.get(config.modmailID).send(modmailEmbed)
                        .then(() => {
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
                })
        }

        // Target Subreddit (defaults to GGDiscordInvites if 'config.subReddit' isn't set)
        r.getSubreddit(config.subReddit || 'GGDiscordInvites')
            // Read 20 Modmail Conversations that are not archived
            .getNewModmailConversations({ limit: 20 })
            .then(processModmailConversations)
            .catch(err => console.log(err));
    },

    // For Invite
    sendModmailInvite: async (user, threadID, inviteCode) => {
        const replyString = `Hi! \n\nThanks for applying to join the r/GirlGamers Discord\n\n` +
            `*Link expires in 24 hours; feel free to ask for another if needed*\n\n` +
            `https://discord.gg/${inviteCode}`;
        const modNote = `Invite issued by ${user.tag}`;
        sendModmail(threadID, replyString, modNote);
    },

    // For Re-invite
    sendModmailReinvite: async (user, threadID, inviteCode) => {
        const replyString = `Here's another invite \n\nhttps://discord.gg/${inviteCode}`;
        const modNote = `Re-invite issued by ${user.tag}`;
        sendModmail(threadID, replyString, modNote);
    },

    // For requesting info or socials
    sendModmailRequestSocials: async (user, threadID) => {
        const replyString = `Thanks for applying; however, due to your posting history we will need more information.\n\n` +
            `Do you mind providing a link to a public text-based social media (not TikTok or Instagram) to verify?\n\n` +
            `Please note that we aren't looking for photo or voice verification,\n` +
            `we want to make sure we're inviting users that contribute to a positive and supportive environment.`;

        const modNote = `Info requested by ${user.tag}`;

        sendModmail(threadID, replyString, modNote);
    },

    // For rejecting men
    sendModmailRejectMan: async (user, threadID) => {
        const replyString = 'Hi! \n\n Thanks for applying; however, this is a female-identifying space so we will have to decline.';

        const modNote = `Denied by ${user.tag}`;

        sendModmail(threadID, replyString, modNote);
    },

    // For archiving an invite post
    sendModmailArchive: async (user, threadID) => {
        const modNote = `Archived by ${user.tag}`;
        sendModNote(threadID, modNote);
    },

    // Reply to ThreadID using Slash Command
    sendModMailReply: async (user, threadID, replyMessage, interaction) => {
        const modNote = `Reply command sent by ${user.tag}`;
        await sendModmail(threadID, replyMessage, modNote);
        await interaction.reply({
            content: `Reply sent to ${threadID}`,
            flags: MessageFlags.Ephemeral,
        });
    },

    // Convert ThreadID to new Button Embed
    convertModMail: async (threadID, interaction) => {
        r.getNewModmailConversation(threadID).fetch().then(fetchedModmail => {
            if (fetchedModmail) {
                // Human readable variable names
                const modmailBody = fetchedModmail.messages[0].bodyMarkdown
                const modmailAuthor = fetchedModmail.messages[0].author.name.name
                const modmailSubject = fetchedModmail.subject
                // Generate Discord Embed, nested Promises
                generateEmbed(threadID, modmailBody, modmailAuthor, modmailSubject)
                    .then(modmailEmbed => {
                        // Send Invite Card with Embeds and Interaction Rows
                        interaction.client.channels.cache.get(config.modmailID).send(modmailEmbed)
                            .then(() => {
                                interaction.reply({
                                    content: `${threadID} has been converted.`,
                                    flags: MessageFlags.Ephemeral,
                                });
                            })
                    })
            } else {
                interaction.reply({
                    content: `[Error] Modmail [${threadID}] does not exist.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        });
    },
}

const sendModmail = async function(threadID, replyString, modNote) {
    r.getNewModmailConversation(threadID).reply(replyString, 'true', 'false').then(() =>
        r.getNewModmailConversation(threadID).reply(modNote, 'false', 'true').then(() => archiveModMail(threadID)),
    ).catch(err => console.log(err));
}

const sendModNote = async function(threadID, modNote) {
    r.getNewModmailConversation(threadID).reply(modNote, 'false', 'true').then(() => archiveModMail(threadID)).catch(err => console.log(err));
}

const archiveModMail = async function(threadID) {
    r.getNewModmailConversation(threadID).archive().catch(err => console.log(err));
}