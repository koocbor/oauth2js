const fs = require('fs');

let authService

module.exports = injectedAuthService => {
    authService = injectedAuthService;

    return {
        seed: seed
    }
}

function seed() {
    seedOAuthClients();
}

const seedOAuthClients = () => {
    console.log('seedOAuthClients called');
    let rawClients = fs.readFileSync('./secrets/oauth_clients.json');
    let oauthClients = JSON.parse(rawClients);
    oauthClients.forEach(client => {
        console.log(client);
        authService.saveClient(client);
    })
}