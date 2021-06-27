"use strict";

const CommandManager = require("./ComandManager");
const Discord = require('discord.js');

class InteractionManager {
    /**
     * 
     * @param {object} interaction Interaction Object
     * @param {Discord.Client} client Discord Client
     * @returns Object
     */
    constructor(interaction, client){
        this.id = interaction.id;
        this.token = interaction.token;
        this.command = new CommandManager(interaction.data);
        this.author = client.users.cache.get(interaction.member.user.id);
        this.channel = client.channels.cache.get(interaction.channel_id);
        return this;  
    }
}

module.exports = InteractionManager;