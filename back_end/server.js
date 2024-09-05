import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cors from 'cors';
import 'dotenv/config';


const app = express();
const corsOptions = { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
const server = http.createServer(app);
const io = new Server(server,{cors : corsOptions});

app.set("port", (process.env.PORT || 8080));
app.use(cors(corsOptions));

const socketToname = {};
const socketToRoom = {};

const start = () => {
    const port = app.get("port");
    server.listen(port, () => {
        console.log(`Listenings at port no ${port}`);
    })

    io.on("connection", (socket) => {
        socket.on("user:join", ({ email, Room }) => {
            socketToname[socket.id] = email;
            socketToRoom[socket.id]=Room;
            socket.join(Room);
            socket.to(Room).emit("user:joined", { email, id: socket.id });
            io.to(socket.id).emit("user:join", { email, Room });
        })

        socket.on("user:call", ({ to, offer }) => {
            if (!to) console.log(`to=${to} user:call`);
            let name=socketToname[socket.id];
            io.to(to).emit("incoming:call", { from: socket.id, offer,name});
        })

        socket.on("call:accepted", ({ to, ans }) => {
            if (!to) console.log(`to=${to} user:call`);
            io.to(to).emit("call:grand",{from : socket.id, ans});
        })

        socket.on("peer:nego:call",({to,offer})=>{
            if (!to) console.log(`to=${to} peer:nego:call`); 
            io.to(to).emit("peer:nego:incoming",{from : socket.id , offer});
        })

        socket.on("peer:nego:ans",({to,ans})=>{
            if (!to) console.log(`to=${to} peer:nego:ans`);
            io.to(to).emit("peer:nego:accepted",{from : socket.id , ans});
        })

        socket.on("disconnect",()=>{
            try 
            {
             delete socketToname[socket.id];
             socket.leave(socketToRoom[socket.id]);
             delete socketToRoom[socket.id];
            }catch(err)
            {
                console.log(err);
            }
        })
    })
}

start();