const express = require("express");
const router = express.Router();
const Code = require("../models/code");

// Save code
router.post("/save", async (req, res) => {
	try {

		const { roomCode, content, language } = req.body;
		console.log({ roomCode, content, language });

		if (roomCode == null || content == null || language == null) {
			return res.status(401).json({ success: false, message: "one of the fields are missing." });
		}

		const codeDoc = await Code.findOne({ roomCode: roomCode });

		if (!codeDoc) {
			console.log('No existing code found, creating new entry.');
			const newCode = new Code({ roomCode, code: content, language });
			const savedCode = await newCode.save();
			return res.status(200).json({ success: true, id: savedCode._id });
		};

		await Code.findOneAndUpdate({ roomCode: roomCode }, { code: content, language: language });

		res.status(200).json({ success: true, id: codeDoc._id });
	} catch (err) {
		console.log('Error saving code:', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// Get code by ID
router.get("/get/:roomCode", async (req, res) => {
	try {
		const code = await Code.findOne({ roomCode: req.params.roomCode });

		if (!code) {
			return res.status(404).json({ success: false, message: "Code not found" });
		}

		res.json({ success: true, code: code.code, language: code.language });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

module.exports = { router };
