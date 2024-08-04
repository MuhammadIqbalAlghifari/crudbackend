const mongoose = require("mongoose");

const itemsSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    status: {
        type: String, 
        required: true
    },
});

module.exports = itemsSchema; // Exporting the schema, not the model
