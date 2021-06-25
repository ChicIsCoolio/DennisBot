    //#region INIT
process.on('uncaughtException', err => console.error(err));
require('dotenv').config();

const BotToken = process.env.BotToken;
const IsOnReplit = process.env.IsOnReplit.toLowerCase() == 'true';

if (IsOnReplit) {
    const { registerFont } = require('canvas');
    registerFont('fonts/BurbankBigRegular-Bold.otf', { family: 'Burbank Big Rg Bd' });
}

if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
  }
//#endregion

const fs = require('fs');
const Discord = require('discord.js');
const DiscordSlash = require('./discord.js-slash-command');
const client = new Discord.Client();
const slash = new DiscordSlash.Slash(client);
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
const { cooldowns, commands } = client;
const config = require('./config.json');

client.on('ready', () => {
    function createCommands() {
        require('./commands').forEach(cmd => {
            const command = new DiscordSlash.CommandBuilder();
            command.setName(cmd.name);
            command.setDescription(cmd.description);
            if (cmd.options) cmd.options.forEach(option => {
                const s = option.split(':');
                const o = new DiscordSlash.CommandBuilder();
                o.setName(s[0]); o.setDescription(s[1]); o.setType(s[2]); o.setRequired(s[3] == 'true');
                command.addOption(o);
            });
            slash.create(command, config.guildId);
            commands.set(cmd.name, cmd);
        });
    }

    fs.watchFile('commands.js', () => {
        delete require.cache[require.resolve('./commands')];
        createCommands();
    });

    slash.on('slashInteraction', async interaction => {
        const { name, options } = interaction.command;
        const args = {};
        if (options) options.forEach(option => args[option.name] = option.value);

        //Cooldown Check
        if (commands.get(name).cooldown) {
            if (!cooldowns.has(name)) { cooldowns.set(name, new Discord.Collection()); }
            if (!cooldowns.get(name).has(interaction.author.id)) { 
                cooldowns.get(name).set(interaction.author.id, Date.now() + commands.get(name).cooldown);
                setTimeout(() => cooldowns.get(name).delete(interaction.author.id), commands.get(name).cooldown);
            }
            else {
                const remain = (cooldowns.get(name).get(interaction.author.id) - Date.now());
                const ago = commands.get(name).cooldown - remain;
                return await interaction.callback(`${interaction.author.username},\nyou used this command like ${(ago / 1000).toFixed(1)} second${(ago / 1000) <= 1000 ? "s" : ""} ago.\nPlease wait at least ${(remain / 1000).toFixed(1)} second${(remain / 1000) <= 1000 ? "s" : ""} before using it again.`);
            }
        }

        if (commands.get(name).globalCooldown) {
            if (!cooldowns.has(name)) { cooldowns.set(name, new Discord.Collection()); }
            if (!cooldowns.get(name).has(0)) { 
                cooldowns.get(name).set(0, Date.now() + commands.get(name).globalCooldown);
                setTimeout(() => cooldowns.get(name).delete(0), commands.get(name).globalCooldown);
            }
            else {
                const remain = (cooldowns.get(name).get(0) - Date.now());
                return await interaction.callback(`Someone already used this command.\nPlease wait at least ${(remain / 1000).toFixed(1)} second${(remain / 1000) <= 1000 ? "s" : ""} before using it.`);
            }
        }

        if (commands.get(name).permissions) {
            for (const permission of commands.get(name).permissions) {
                if (!interaction.channel.members.get(interaction.author.id).hasPermission(permission)) {
                    interaction.callback(config.commands.noPermissions);
                    return;
                }
            }
        }

        return await commands.get(name).execute(interaction, args, client);
    });

    createCommands();
    fs.readdirSync('modules').forEach(module => { require('./modules/' + module)(client, { slash: slash });});
});

client.login(BotToken);