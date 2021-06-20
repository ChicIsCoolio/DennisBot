const express = require('express');
const app = express();

module.exports = () => {
    app.get('/', (req, res) => res.redirect('/ping'));
    app.get('/ping', (req, res) => { res.status(200).end(); });
    app.post('/:channel/send/', (req, res) => {
        if (req.headers.authorization.split(' ')[1] == AccessToken) {
            client.channels.fetch(req.params.channel).send(req.body.message);
            res.status(200).end();
        } else res.status(401).end();
    });
    app.listen(80);
}