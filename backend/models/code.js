const mongoose = require("mongoose");
const constants = require("../routes/constant");

const codeSchema = new mongoose.Schema({
	roomCode: { type: String, required: true },
	code: { type: String, required: true },
	language: { type: String, default: constants.languageSupported.JAVASCRIPT, enum: constants.languageSupported },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("code", codeSchema);