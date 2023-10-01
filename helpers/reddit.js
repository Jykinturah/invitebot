/** Reddit API Mod Mail Check, for Invite Requests */
const snoowrap = require('snoowrap');

/** Reddit API Wrapper */
const r = new snoowrap({
    userAgent: 'invite-bot',
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken
});

const getModmail = async function(){
    r.getSubreddit('GGDiscordInvites').getNewModmailConversations({
        limit: 1
    }).then(modmail => {
        if (modmail[0].messages[0].author.name.name === 'GirlGamersDiscord') return;
        // const inviteEmbed = new Discord.MessageEmbed()
        //     .setColor(config.embedColor)
        //     .setTitle(modmail[0].subject)
        //     .addFields({
        //         name: 'Message',
        //         value: modmail[0].messages[0].bodyMarkdown
        //     }, {
        //         name: 'Author',
        //         value: modmail[0].messages[0].author.name.name,
        //         inline: true
        //     }, {
        //         name: 'Thread ID',
        //         value: modmail[0].id,
        //         inline: true
        //     })
        //     .addFields({
        //         name: 'Profile',
        //         value: `[Go to Reddit Profile](https://www.reddit.com/user/${modmail[0].messages[0].author.name.name}) ➡\n┗ [by Controversial](https://www.reddit.com/${modmail[0].messages[0].author.name.name}?sort=controversial) ➡`,
        //         inline: true
        //     }, {
        //         name: 'Link',
        //         value: `[Go to Modmail Thread](https://mod.reddit.com/mail/all/${modmail[0].id}) ➡`,
        //         inline: true
        //     })
        // const inviteRow1 = new Discord.MessageActionRow()
        //     .addComponents(
        //         new Discord.MessageButton().setCustomId("invite").setLabel("Invite").setStyle('SUCCESS'),
        //         new Discord.MessageButton().setCustomId("reinvite").setLabel("Re-invite").setStyle('SUCCESS').setDisabled(true),
        //         new Discord.MessageButton().setCustomId("requestSocials").setLabel("Request Socials").setStyle('PRIMARY'),
        //         new Discord.MessageButton().setCustomId("secondOpinion").setLabel("Need 2nd Opinion").setStyle('SECONDARY')
        //     );
        // const inviteRow2 = new Discord.MessageActionRow()
        //     .addComponents(
        //         new Discord.MessageButton().setCustomId("manReject").setLabel("Man").setStyle('DANGER'),
        //         new Discord.MessageButton().setCustomId("archive").setLabel("Dismiss").setStyle('DANGER')
        //     );
        // client.channels.cache.get(config.modmailID).send({
        //     embeds: [inviteEmbed],
        //     components: [inviteRow1, inviteRow2]
        // });
        r.getNewModmailConversation(modmail[0].id).archive();
    });
}

const sendModmail = async function (r, threadID, replyString){
    r.getNewModmailConversation(threadID)
        .reply(replyString)
        .then(() => 
            r.getNewModmailConversation(threadID).archive()
        );
}

module.exports = {
    getModmail: getModmail,
    sendModmail: sendModmail
};