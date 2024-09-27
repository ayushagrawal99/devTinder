const mongoose = require('mongoose');

const dbConnect = async () => {
    await mongoose.connect("mongodb+srv://ayushagrawal9470:sTw5KkdtImEPMxK7@ayushtest.ldidm.mongodb.net/devTinder");
}

module.exports = dbConnect;