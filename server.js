const port = process.env.PORT || 4000;
const app = require('./app_openapi');

app.listen(port, () => {
  console.log(`Express server listener in port ${port}`);
});
