const fetch = require('node-fetch');

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
        description: "Wanna get the server invite link?",
        cooldown: 60000,
        globalCooldown: 5000,
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
    }
];