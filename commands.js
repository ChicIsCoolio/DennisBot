const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const InteractionManager = require('./discord.js-slash-command/src/Manager/InteractionManager');

/* OPTION TYPES
    SUB_COMMAND
    SUB_COMMAND_GROUP
    STRING
    INTEGER
    BOOLEAN
    USER
    CHANNEL
    ROLE
*/

module.exports = [
    {
        name: 'invite',
        displayName: "Invite",
        description: "Sends the server invite link",
        cooldown: 60000,
        globalCooldown: 5000,
        /**
         * @param {InteractionManager} interaction
         */
        async execute(interaction, args) {
            const config = require('./config.json');

            await interaction.callback("Here's the link:\n" + config.serverInvite);
        }
    },
    {   
        name: 'clear',
        displayName: "Clear",
        description: "Deletes the desired number of messages.",
        options: ['amount:The amount of messages you want to delete:INTEGER:true'],
        permissions: ['MANAGE_MESSAGES'],
        /**
         * @param {InteractionManager} interaction
         */
        async execute(interaction, args) {
            const config = require('./config.json');

            woo = async callback => {
                await interaction.callback(callback.size > 0 ? `Deleted ${callback.size} message${callback.size > 1 ? "s" : ""}, Ghost Boss!` : config.commands.clear.nothingToDelete);
                setTimeout(() => fetch(`https://discord.com/api/v8/webhooks/740064676607426622/${interaction.token}/messages/@original`, { method: 'DELETE' }), 3000);
            };
            
            if (args.amount > 0) {
                const callback = await interaction.channel.bulkDelete(args.amount <= 100 ? args.amount : 100, true);
                await woo(callback);
            }
            else await woo({size: 0});
        }
    },
    {
        name: 'report',
        displayName: "Report",
        description: "Report someone",
        options: ['who:Who do you want to report?:USER:true', 'why:What did the person do?:STRING:true'],
        /**
         * @param {InteractionManager} interaction
         */
        async execute(interaction, args, client) {
            const { report } = require('./config.json').commands;
            const who = await interaction.channel.guild.members.fetch(args.who);

            const pin = await interaction.channel.send(report.pin);
            const url = `https://discord.com/channels/${interaction.channel.guild.id}/${interaction.channel.id}/${pin.id}`;
            const embed = new MessageEmbed().setTitle(report.title.format(interaction.author, who, args.why, url, interaction.author.tag, who.user.tag))
                .setDescription(report.description.format(interaction.author, who, args.why, url, interaction.author.tag, who.user.tag))
                .setColor(report.color).setAuthor(report.author.format(interaction.author, who, args.why, url, interaction.author.tag, who.user.tag),
                    report.author.includes('{5}') ? who.user.avatarURL() : report.author.includes('{4}') ? interaction.author.avatarURL() : '')
                .setFooter(report.footer.format(interaction.author, who, args.why, url, interaction.author.tag, who.user.tag),
                    report.footer.includes('{5}') ? who.user.avatarURL() : report.footer.includes('{4}') ? interaction.author.avatarURL() : '')
                .setTimestamp();
            
            await (await client.channels.fetch(report.channel)).send(embed);
            await interaction.callback(report.done);
        }
    },
    {
        name: 'warn',
        displayName: "Warn",
        description: "Warn someone",
        options: ['who:Who do you want to warn?:USER:true', 'message:Message to the persons:STRING:true'],
        permissions: ['KICK_MEMBERS'],
        /**
         * @param {InteractionManager} interaction
         */
        async execute(interaction, args, client) {
            const { warn } = require('./config.json').commands;
            const who  = await interaction.channel.guild.members.fetch(args.who);
            if (who.user.bot) return await interaction.callback(warn.isBot);
            const channel = await who.createDM();

            const embed = new MessageEmbed().setTitle(warn.title.format(interaction.author, who, args.message))
                .setDescription(warn.description.format(interaction.author, who, args.message))
                .setColor(warn.color).setFooter(warn.footer.format(interaction.author, who, args.message),
                    warn.footer.includes('{5}') ? who.user.avatarURL() : warn.footer.includes('{4}') ? interaction.author.avatarURL() : '')
                .setTimestamp();

            await channel.send(embed);
            await interaction.callback(warn.done.format(interaction.author, who, args.message));
        }
    }
];