const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/test", {
    keepAlive: true
});

mongoose.connection.on("error", err => {
    console.error("Connection to mongodb server failed.");
    console.error(err);
});

mongoose.connection.once("open", () => {
    console.info("Connection to mongodb server was successful.");
});

module.exports = mongoose;