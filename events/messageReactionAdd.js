'use strict';

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
    
        /** Report Acknowledgement Logic */
        if (reaction.emoji.name === '👍') {
            if (reaction.message.partial) await reaction.message.fetch();
            if (!reaction.message.author.bot) return;
            if (user.bot) return;
            if (!(reaction.message.embeds[0].fields[5].name === 'Response')) return;
            const getReport = reaction.message.embeds[0].spliceFields(5, 1);
            const reportEdit = new Discord.MessageEmbed(getReport)
                .addFields({
                    name: 'Acknowledged by',
                    value: user.tag,
                    inline: true
                })
            reaction.message.edit(reportEdit);
            reaction.remove();
        };
    
        // Accept
        if (reaction.emoji.name === '✅') {
            if (reaction.message.partial) await reaction.message.fetch();
            if (!reaction.message.author.bot) return;
            if (user.bot) return;
            if (!(reaction.message.channel.id === config.modmailID)) return;
            let channel = client.channels.cache.get(config.inviteID);
            let threadID = reaction.message.embeds[0].fields[3].value;
            channel.createInvite({
                maxUses: 1,
                unique: true
            }).then(invite => {
                sendModMail(threadID, `Hi! \n\n Thanks for applying to join the r/GirlGamers Discord \n\n *Link expires in 24 hours; feel free to ask for another if needed* \n\n https://discord.gg/${invite.code}`);
            });
            reaction.message.delete()
        };
    
        // Man
        if (reaction.emoji.name === '👨') {
            if (reaction.message.partial) await reaction.message.fetch();
            if (!reaction.message.author.bot) return;
            if (user.bot) return;
            if (!(reaction.message.channel.id === config.modmailID)) return;
            let threadID = reaction.message.embeds[0].fields[3].value;
            sendModMail(threadID, 'Hi! \n\n Thanks for applying; however, this is a female-identifying space so we will have to decline.');
            reaction.message.delete();
        };
    
        // Request Info
        if (reaction.emoji.name === 'ℹ') {
            if (reaction.message.partial) await reaction.message.fetch();
            if (!reaction.message.author.bot) return;
            if (user.bot) return;
            if (!(reaction.message.channel.id === config.modmailID)) return;
            let threadID = reaction.message.embeds[0].fields[3].value;
            sendModMail(threadID, `Thanks for applying; however, due to your posting history we will need more information. \n\n Do you mind providing a link to a public text-based social media (not TikTok or Instagram) to verify? \n\n Please note that we aren't looking for photo or voice verification, \n we want to make sure we're inviting users that contribute to a positive and supportive environment.`);
            reaction.message.delete();
        };
    
        // Resend Invite
        if (reaction.emoji.name === '🔄') {
            if (reaction.message.partial) await reaction.message.fetch();
            if (!reaction.message.author.bot) return;
            if (user.bot) return;
            if (!(reaction.message.channel.id === config.modmailID)) return;
            let channel = client.channels.cache.get(config.inviteID);
            let threadID = reaction.message.embeds[0].fields[3].value;
            channel.createInvite({
                maxUses: 1,
                unique: true
            }).then(invite => {
                sendModMail(threadID, `Here's another invite \n\n https://discord.gg/${invite.code}`);
            });
            reaction.message.delete();
        };
    
        // Archive
        if (reaction.emoji.name === '🔥') {
            if (reaction.message.partial) await reaction.message.fetch();
            if (!reaction.message.author.bot) return;
            if (user.bot) return;
            if (!(reaction.message.channel.id === config.modmailID)) return;
            let threadID = reaction.message.embeds[0].fields[3].value;
            r.getNewModmailConversation(threadID).archive();
            reaction.message.delete();
        };
    
        // Second Opinion
        if (reaction.emoji.name === '❓') {
            if (reaction.message.partial) await reaction.message.fetch();
            if (!reaction.message.author.bot) return;
            if (user.bot) return;
            if (!(reaction.message.channel.id === config.modmailID)) return;
            if (reaction.message.embeds[0].fields[5].name === 'Second Opinion By') return;
            const inviteEdit = new EmbedBuilder(reaction.message.embeds[0]).spliceFields(5, 1)
                .addFields({
                    name: 'Second Opinion By',
                    value: user.tag,
                    inline: true
                }, {
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