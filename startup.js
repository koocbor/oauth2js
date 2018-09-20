const fs = require('fs');
const path = require('path');

let authService;

const seedOAuthClients = () => {
  console.log('seedOAuthClients called');
  const rawClients = fs.readFileSync(path.resolve(__dirname, './secrets/oauth_clients.json'), 'utf-8');
  const oauthClients = JSON.parse(rawClients);
  oauthClients.forEach((client) => {
    console.log(client);
    authService.saveClient(client);
  });
};

function seed() {
  seedOAuthClients();
}

module.exports = (injectedAuthService) => {
  authService = injectedAuthService;

  return {
    seed,
  };
};
