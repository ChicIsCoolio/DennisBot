const Discord = require('discord.js');
const { Canvas, loadImage } = require('canvas');
const fs = require('fs');

/**
 * @param {Discord.Client} client
 */
module.exports = client => {
    client.on('guildMemberAdd', async member => {
        const { welcomeMessage } = require('../config.json');

        let canvas = new Canvas(welcomeMessage.width, welcomeMessage.height);
        let ctx = canvas.getContext('2d');
        let { width, height } = canvas;
        
        //Draw Background
        ctx.fillStyle = welcomeMessage.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        //Draw Columns
        ctx.fillStyle = welcomeMessage.color;
        ctx.fillRect(width * 3.125 / 100, 0, width * 7.5 / 100, height);
        ctx.fillRect(width - width * 7.5 / 100 - width * 3.125 / 100, 0, width * 7.5 / 100, height);
        //Draw Tag
        ctx.fillStyle = '#ffffff';
        ctx.font = '60px "Burbank Big Rg Bd"';
        const tagWidth = ctx.measureText(member.user.tag).width;
        ctx.fillText(member.user.tag, width / 2 - tagWidth / 2, height - height * 5 / 100);
        //Draw "Welcome"
        ctx.fillStyle = welcomeMessage.color;
        ctx.font = '30px "Burbank Big Rg Bd"';
        const welcomeWidth = ctx.measureText('Welcome').width;
        ctx.fillText('Welcome', width / 2 - welcomeWidth / 2, height - height * 20 / 100);
        //Draw Pfp
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, width * 2.5 / 100 + welcomeMessage.pfpSize / 2, welcomeMessage.pfpSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        const pfp =  await loadImage((member.user.displayAvatarURL() + '?size=256').replace('webp', 'png'));
        ctx.drawImage(pfp, width / 2 - welcomeMessage.pfpSize / 2, width * 2.5 / 100, 256, 256);
        ctx.restore();
        //Save
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`temp/welcomeCard_${member.id}.png`, buffer);

        //Discord Message
        const embed = new Discord.MessageEmbed()
        .setColor(welcomeMessage.color)
        .setTitle(welcomeMessage.title.replace('$username$', member.displayName).replace('$tag$', member.user.tag).replace('$mention$', member.toString()))
        .setDescription(welcomeMessage.message.replace('$username$', member.displayName).replace('$tag$', member.user.tag).replace('$mention$', member.toString()))
        .setFooter(welcomeMessage.footer.replace('$username$', member.displayName).replace('$tag$', member.user.tag).replace('$mention$', member.toString()), member.user.displayAvatarURL())
        .attachFiles([`temp/welcomeCard_${member.id}.png`])
        .setImage(`attachment://welcomeCard_${member.id}.png`)
        .setTimestamp();

        client.channels.fetch(welcomeMessage.channel).then(channel => {
            channel.send(embed).then(() => {
                fs.rm(`temp/welcomeCard_${member.id}.png`);
            });
        });
    });
}