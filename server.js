var port = process.env.PORT || 4000;
var app = require('./app');

var server = app.listen(port, function() {
    console.log(`Express server listener in port ${port}`);
})

