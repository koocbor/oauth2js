const fs = require('fs');

let authService;

const seedOAuthClients = () => {
  console.log('seedOAuthClients called');
  const rawClients = fs.readFileSync('./secrets/oauth_clients.json');
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
