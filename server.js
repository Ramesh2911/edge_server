require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`
==========================================
🚀 Real Estate API Started
==========================================
Environment : ${process.env.NODE_ENV}
Port        : ${PORT}
URL         : http://localhost:${PORT}
API         : http://localhost:${PORT}/api/${process.env.API_VERSION}
==========================================
`);

});