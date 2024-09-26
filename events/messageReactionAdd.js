'use strict';

const { sendModmailInvite, sendModmailRejectMan, sendModmailRequestSocials, sendModmailReinvite, sendModmailArchive } = require("../helpers/reddit");

/** * !!!!! THIS SECTION MUST BE PRESERVED TO ALLOW OLDER INVITE EMBEDS TO FUNCTION !!!!! * **/
module.exports = {
    name: 'messageReactionAdd',
    async execute (reaction, user){

        // Moved these out of `if` to keep the code D.R.Y.
        if (reaction.message.partial) await reaction.message.fetch();
        if (!(reaction.message.channel.id === config.modmailID)) return;
        if (!reaction.message.author.bot) return;
        if (user.bot) return;
    
        /** START Invite Post Reactions Code Block **/
        const client = reaction.client;
        const channel = client.channels.cache.get(config.inviteID);
        const threadID = reaction.message.embeds[0].fields[3].value;
        
        // Accept
        if (reaction.emoji.name === '✅') {
            channel.createInvite({
                maxUses: 1,
                unique: true
            }).then(invite => {
                sendModmailInvite(user,threadID,invite.code);
            });
            reaction.message.delete()
        };
    
        // Man
        if (reaction.emoji.name === '👨') {
            sendModmailRejectMan(user,threadID);
            reaction.message.delete();
        };
    
        // Request Info
        if (reaction.emoji.name === 'ℹ') {
            sendModmailRequestSocials(user,threadID);
            reaction.message.delete();
        };
    
        // Resend Invite
        if (reaction.emoji.name === '🔄') {
            channel.createInvite({
                maxUses: 1,
                unique: true
            }).then(invite => {
                sendModmailReinvite(user,threadID,invite.code);
            });
            reaction.message.delete();
        };
    
        // Archive
        if (reaction.emoji.name === '🔥') {
            sendModmailArchive(user,threadID);
            reaction.message.delete();
        };
    
        // Second Opinion
        if (reaction.emoji.name === '❓') {
            if (reaction.message.embeds[0].fields[5].name === 'Second Opinion By') return;
            const inviteEdit = new EmbedBuilder(reaction.message.embeds[0]).spliceFields(5, 1)
                .addFields({
                    name: 'Second Opinion By',
                    value: user.tag,
                    inline: true
                },
                {
                    name: 'Responses',
                    value: '✅ Accept | 👨 Man | ℹ Request Info | 🔄 Resend Invite \n 🔥 Archive'
                })
                .setColor(config.secondOpinionColor);
            reaction.message.edit({
                embeds: [inviteEdit]
            });
            reaction.remove();
        };
    }
}