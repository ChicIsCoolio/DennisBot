const fetch = require('node-fetch');

module.exports = [
    {
        name: 'ping',
        description: "Pong!",
        globalCooldown: 10000,
        execute(interaction) {
            interaction.callback("Pong!");
        }
    },
    {
        name: 'clear',
        displayName: "Clear",
        description: "Clears the desired number of messages.",
        options: ['amount:The amount of messages you want to delete:4:true'],
        permissions: ['MANAGE_MESSAGES'],
        execute(interaction, args) {
            woo = callback => {
                interaction.callback(callback.size > 0 ? `Deleted ${callback.size} message${callback.size > 1 ? "s" : ""}, Ghost Boss!` : "Commander, I'm pretty sure I can't delete **nothing**.").then(() => {
                    setTimeout(() => fetch(`https://discord.com/api/v8/webhooks/740064676607426622/${interaction.token}/messages/@original`, { method: 'DELETE' }), 3000);
                });
            };
            
            if (args.amount > 0) interaction.channel.bulkDelete(args.amount <= 100 ? args.amount : 100, true).then(callback => {woo(callback)});
            else woo({size: 0});
        }
    }
];