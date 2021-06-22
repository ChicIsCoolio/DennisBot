const fetch = require('node-fetch');
const config = require('./config.json');

module.exports = [
    {
        name: 'ping',
        description: "Pong!",
        globalCooldown: 10000,
        async execute(interaction) {
            await interaction.callback("Pong!");
        }
    },
    {
        name: 'clear',
        displayName: "Clear",
        description: "Clears the desired number of messages.",
        options: ['amount:The amount of messages you want to delete:4:true'],
        permissions: ['MANAGE_MESSAGES'],
        async execute(interaction, args) {
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