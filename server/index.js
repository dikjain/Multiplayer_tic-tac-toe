
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
    }
});

// Basic route for testing the Express server

const alluser = [] // Store users

// Set up Socket.IO connection
io.on("connection", (socket) => {
    const currentuser = { socket: socket };

    socket.on("reqtoplay", (username) => {
        // Add new user to the alluser array
        alluser.push({
            ...currentuser,
            id: socket.id,
            online: true,
            username: username.username,
            playing: false
        });

        let opponentFound = false;

        // Find an opponent for the current player
        for (const user of alluser) {
            if (user.online && !user.playing && user.id !== socket.id) {
                const opponent = user;
                const currentplayer = alluser.find((u) => u.id === socket.id);

                if (currentplayer) {
                    // Mark both players as playing
                    opponent.playing = true;
                    currentplayer.playing = true;

                    // Notify both players that an opponent is found
                    io.to(opponent.id).emit("opponentfound", { opponent: currentplayer.username,playingas : 'circle' });
                    io.to(currentplayer.id).emit("opponentfound", { opponent: opponent.username,playingas:"cross" });

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

    socket.on("movefromplayer",(data)=>{
        io.emit("movefromopponent",data)
    })

    socket.on("currentplayer",(data)=>{
        io.emit("changecurrentplayer",data)
        
    })

    // Handle user disconnection
    socket.on("disconnect", () => {
        const offlineuser = alluser.find(user => user.id === socket.id);
        if (offlineuser) {
            offlineuser.online = false;
        }
    });
});

const __dirname = path.resolve()




app.use(express.static(path.join(__dirname, 'dist')))
app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'dist','index.html'));
});
const PORT = 3000;
httpServer.listen(PORT, () => {
});
