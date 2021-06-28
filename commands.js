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
            const { embed } = report;
            const who = await interaction.channel.guild.members.fetch(args.who);

            const pin = await interaction.channel.send(report.pin);
            const url = `https://discord.com/channels/${interaction.channel.guild.id}/${interaction.channel.id}/${pin.id}`;
            const e = new MessageEmbed().setTitle(embed.title.format(interaction.author, who, args.why, url, interaction.author.tag, who.user.tag))
                .setDescription(embed.description.format(interaction.author, who, args.why, url, interaction.author.tag, who.user.tag))
                .setColor(embed.color).setAuthor(embed.author.format(interaction.author, who, args.why, url, interaction.author.tag, who.user.tag),
                    embed.author.includes('{5}') ? who.user.avatarURL() : embed.author.includes('{4}') ? interaction.author.avatarURL() : '')
                .setFooter(embed.footer.format(interaction.author, who, args.why, url, interaction.author.tag, who.user.tag),
                    embed.footer.includes('{5}') ? who.user.avatarURL() : embed.footer.includes('{4}') ? interaction.author.avatarURL() : '')
                .setTimestamp();
            
            await (await client.channels.fetch(report.channel)).send(e);
            await interaction.callback('Done!');
        }
    }
];