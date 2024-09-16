import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const app = express(); // Initialize an Express application
const httpServer = createServer(app); // Create an HTTP server from the Express app

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"],
    },
    transports: ['websocket'] 
});

let allUsers = []; // Track all users

// Set up Socket.IO connection
io.on("connection", (socket) => {
    const currentUser = { id: socket.id, socket: socket };

    socket.on("reqtoplay", (username) => {
        // Add new user to the allUsers array
        allUsers.push({
            ...currentUser,
            id: socket.id,
            online: true,
            username: username.username,
            playing: false
        });

        let opponentFound = false;

        // Find an opponent for the current player
        for (const user of allUsers) {
            if (user.online && !user.playing && user.id !== socket.id) {
                const opponent = user;
                const currentPlayer = allUsers.find((u) => u.id === socket.id);

                if (currentPlayer) {
                    // Mark both players as playing
                    opponent.playing = true;
                    currentPlayer.playing = true;

                    // Create a unique room for both players
                    const roomId = `${currentPlayer.id}-${opponent.id}`;
                    
                    // Add both players to the room
                    socket.join(roomId);
                    opponent.socket.join(roomId);

                    // Notify both players about the match
                    io.to(opponent.id).emit("opponentfound", { opponent: currentPlayer.username, playingas: 'circle' });
                    io.to(currentPlayer.id).emit("opponentfound", { opponent: opponent.username, playingas: "cross" });

                    // Assign the room to both players for future moves
                    currentPlayer.roomId = roomId;
                    opponent.roomId = roomId;

                    opponentFound = true;
                    break;
                }
            }
        }

        // If no opponent was found, notify the current player
        if (!opponentFound) {
            socket.emit("opponentNotfound");
        }
    });

    socket.on("movefromplayer", (data) => {
        const currentPlayer = allUsers.find((user) => user.id === socket.id);
        if (currentPlayer && currentPlayer.roomId) {
            // Emit the move only to the players in the current player's room
            io.to(currentPlayer.roomId).emit("movefromopponent", data);
        }
    });
    socket.on("inqueue", () => {
        const currentPlayer = allUsers.find((user) => user.id === socket.id);
        currentPlayer.playing = false;
        socket.emit("reqtoplay",{
            username: currentPlayer.username,
          })
        
    });

    socket.on("currentplayer", (data) => {
        const currentPlayer = allUsers.find((user) => user.id === socket.id);
        if (currentPlayer && currentPlayer.roomId) {
            // Notify the current player in their room
            io.to(currentPlayer.roomId).emit("changecurrentplayer", data);
        }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        const offlineUser = allUsers.find(user => user.id === socket.id);
        if (offlineUser) {
            offlineUser.online = false;
            if (offlineUser.roomId) {
                io.to(offlineUser.roomId).emit("opponentleft");
                // Remove both players from the room
                allUsers.forEach(user => {
                    if (user.roomId === offlineUser.roomId) {
                        user.playing = false;
                        user.roomId = null;
                    }
                });
            }
        }
        allUsers = allUsers.filter(user => user.id !== socket.id); // Clean up user
    });
    
});

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
