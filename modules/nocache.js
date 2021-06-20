const { readdirSync } = require('fs');

module.exports = () => {
    nocache = module => require('fs').watchFile(require('path').resolve(module), () => delete require.cache[require.resolve('../' + module)]);

    nocache('config.json');
}