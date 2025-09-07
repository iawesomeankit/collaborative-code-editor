const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require('http');
const { Server } = require('socket.io');

const app = express();

const PORT = 3125;

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: '*' }
});

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/code-collab", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => console.log("✅ MongoDB Connected"))
	.catch(err => console.error("❌ MongoDB Connection Failed:", err));

/** Set our api routes */
app.use('/api', require("./routes"));

const rooms = Object.create(null);

// {
// 	"room123": {
// 		"code": "console.log('Hello, world!');",
// 			"users": {
// 			"abcde12345": "Alice",
// 				"fghij67890": "Bob"
// 		}
// 	},
// 	"room456": {
// 		"code": "<h1>Welcome!</h1>",
// 			"users": {
// 			"klmno11223": "Charlie"
// 		}
// 	}
// }

io.on('connection', socket => {
	console.log("New client connected", socket.id);

	socket.on('join-room', async ({ roomId, username }) => {
		try {
			socket.join(roomId);
			rooms[roomId] = rooms[roomId] || { code: '', users: {} };
			rooms[roomId].users[socket.id] = username || 'Anonymous';


			// socket.emit('load-document', { code: rooms[roomId].code });

			io.to(roomId).emit('users-update', {
				users: Object.values(rooms[roomId].users)
			});

			io.to(roomId).emit('system-message', { text: `${rooms[roomId].users[socket.id]} joined the room` });
			console.log(`${username} joined room ${roomId}`);

		} catch (err) {
			console.error("Error joining the room", err);
		}
	});

	socket.on('code-changes', async ({ roomId, code, sender }) => {
		console.log("code changes", roomId, code, sender);
		if (!roomId) return;
		rooms[roomId] = rooms[roomId] || { code: '', users: {} };

		rooms[roomId].code = code;

		socket.to(roomId).emit('receive-changes', { code, sender });

	});

	socket.on('language-changes', async ({ roomId, language }) => {
		if (!roomId) return;
		socket.to(roomId).emit('receive-language-changes', { language });

	});

	socket.on('chat-message', ({ roomId, message, sender }) => {
		if (!roomId) return;
		socket.to(roomId).emit('receive-chat-message', { message, sender });
	});

	socket.on('leave-room', ({ roomId }) => {
		if (!roomId) return;
		if (rooms[roomId] && rooms[roomId].users[socket.id]) {
			const username = rooms[roomId].users[socket.id];
			delete rooms[roomId].users[socket.id];
			socket.leave(roomId);
			io.to(roomId).emit('users-update', { users: Object.values(rooms[roomId].users) });
			io.to(roomId).emit('system-message', { text: `${username} left the room` });
		}
	})


	// cleanup on disconnect
	socket.on('disconnect', () => {
		// find room(s) where this socket existed
		for (const roomId of Object.keys(rooms)) {
			if (rooms[roomId].users && rooms[roomId].users[socket.id]) {
				const username = rooms[roomId].users[socket.id];
				delete rooms[roomId].users[socket.id];
				io.to(roomId).emit('users-update', { users: Object.values(rooms[roomId].users) });
				io.to(roomId).emit('system-message', { text: `${username} disconnected` });
			}
		}
		console.log(`socket disconnected: ${socket.id}`);
	});
});


server.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});