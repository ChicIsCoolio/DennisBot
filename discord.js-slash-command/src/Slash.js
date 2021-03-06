"use strict";

const CommandManager = require("./Manager/ComandManager");
const InteractionManager = require("./Manager/InteractionManager");
const { Events } = require("./Utils/Constant");
const { Client } = require("discord.js");
const EventEmitter = require("events");
const fetch = require("node-fetch");

class Slash extends EventEmitter {
    /**
     * 
     * @param {Client} client Client class
     */
    constructor(client){
        super();
        client.on("ready", () => {
            this.client = client;
            this.token = client.token;
            this.appid = client.user.id;
            client.ws.on("INTERACTION_CREATE", interaction => {
                client.channels.fetch(interaction.channel_id);
                client.users.fetch(interaction.member.user.id).then(async () => {
                    let interactions = await new InteractionManager(interaction, this.client);
                    interactions.callback = function(callback){
                        return client.api.interactions(interaction.id, interaction.token).callback.post(JSON.parse(`{"data":{"type":4,"data":`+((typeof(callback) == "object") ? JSON.stringify({embeds: [callback]}) : JSON.stringify({content: callback}))+`}}`));
                    }
                    this.emit(Events.SLASH_INTERACTION, interactions);
                });
            });
        });
    }

    /**
     * 
     * @param {string} [commandid] Command ID
     * @param {string} [guildid] Guild ID
     * @returns Object
     */
    async get(commandid, guildid){
        commandid = (commandid == undefined) ? null : commandid;
        guildid = (guildid == undefined) ? null : guildid;
        return new Promise((resolve, reject) => {
            fetch(`https://discord.com/api/v8/applications/${this.appid}` + ((guildid != null) ? `/guilds/${guildid}` : "") + ((commandid != null) ? `/commands/${commandid}` : "/commands"),{
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bot " + this.token
                },
                method: "GET"
            })
            .then(res=>res.json())
            .then(json => {
                if(json.message != undefined) throw json.message;
                if(Array.isArray(json)){
                    let arr = [];
                    json.forEach((json) => {
                        arr.push(new CommandManager(json));
                    });
                    resolve(arr);
                }else{
                    resolve(new CommandManager(json));
                }
            })
            .catch(reject);
        });
    }

    /**
     * 
     * @param {string} commandid Command ID
     * @param {CommandBuilder} commandObject JS Object
     * @param {string} [guildid] Guild ID
     * @returns Object
     */
    async update(commandid, commandObject, guildid){
        guildid = (guildid == undefined) ? null : guildid;
        return new Promise((resolve, reject) => {
            fetch(`https://discord.com/api/v8/applications/${this.appid}` + ((guildid != null) ? `/guilds/${guildid}` : "") + `/commands/${commandid}`,{
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bot " + this.token
                },
                method: "PATCH",
                body: JSON.stringify(commandObject)
            })
            .then(res=>res.json())
            .then(json => {
                if(json.message != undefined) throw json.message;
                if(Array.isArray(json)){
                    let arr = [];
                    json.forEach((json) => {
                        arr.push(new CommandManager(json));
                    });
                    resolve(arr);
                }else{
                    resolve(new CommandManager(json));
                }
            })
            .catch(reject);
        });
    }

    /**
     * 
     * @param {object} commandObject JS Object
     * @param {string} [guildid] Guild ID
     * @returns Object
     */
    async create(commandObject, guildid){
        guildid = ((guildid == undefined) ? null : guildid);
        return new Promise((resolve, reject) => {
            fetch(`https://discord.com/api/v8/applications/${this.appid}` + ((guildid != null) ? `/guilds/${guildid}` : "") + `/commands`,{
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bot " + this.token
                },
                method: "POST",
                body: JSON.stringify(commandObject)
            })
            .then(res=>res.json())
            .then(json=>{
                if(json.message != undefined) throw json.message;
                if(Array.isArray(json)){
                    let arr = [];
                    json.forEach((json) => {
                        arr.push(new CommandManager(json));
                    });
                    resolve(arr);
                }else{
                    resolve(new CommandManager(json));
                }
            })
            .catch(reject);
        });
    }

    /**
     * 
     * @param {string} commandid Command ID
     * @param {string} [guildid] Guild ID
     */
    async delete(commandid, guildid){
        guildid = ((guildid == undefined) ? null : guildid);
        new Promise((resolve, reject) => {
            fetch(`https://discord.com/api/v8/applications/${this.appid}` + ((guildid != null) ? `/guilds/${guildid}` : "") + `/commands/${commandid}`,{
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bot " + this.token
                },
                method: "DELETE"
            })
            .then(res=>{
                if(res.status != 204) throw res.statusText;
                resolve(res.status+" Deleted");
            })
            .catch(reject)
        })
    }
}

module.exports = Slash;