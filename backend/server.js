
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let rooms = {};

app.use(express.static("public"));

app.get("/rooms", (req, res) => {
    res.json({ rooms: Object.keys(rooms) });
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", (room) => {
        if (!rooms[room]) rooms[room] = { players: [] };
        rooms[room].players.push(socket.id);
        socket.join(room);
        console.log(`${socket.id} joined room: ${room}`);
        io.to(room).emit("updatePlayers", rooms[room].players);
    });

    socket.on("playerMove", ({ room, position }) => {
        io.to(room).emit("updatePlayerPosition", { id: socket.id, position });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        for (const room in rooms) {
            rooms[room].players = rooms[room].players.filter((id) => id !== socket.id);
            if (rooms[room].players.length === 0) delete rooms[room];
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
