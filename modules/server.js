const config = require('../config.json');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const AccessToken = process.env.AccessToken;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

module.exports = (client, other, sla) => {
    const { slash } = other;

    app.get('/', (req, res) => res.redirect('/ping'));
    app.get('/ping', (req, res) => { res.status(204).end(); });
    
    app.get('/commands/list', (req, res) => {
        slash.get(null, config.guildId).then(commands => res.send(commands));
    });

    app.get('/commands/:commandId', (req, res) => {
        slash.get(req.params.commandId, config.guildId).then(command => res.send(command));
    });

    app.delete('/commands/:commandId', (req, res) => {
        if (req.headers.authorization.split(' ')[1] == AccessToken) {
            slash.delete(req.params.commandId, config.guildId).then(() => res.status(204).end());
        } else res.status(401).end();
    })
    
    app.post('/:channel/send/', (req, res) => {
        if (req.headers.authorization.split(' ')[1] == AccessToken) {
            client.channels.fetch(req.params.channel).then(channel => {
                channel.send(req.body.message);
                res.status(204).end();
            });
        } else res.status(401).end();
    });
    
    app.listen(config.server.port, () => console.log(config.server.onListen.format(config.server.port)));
}