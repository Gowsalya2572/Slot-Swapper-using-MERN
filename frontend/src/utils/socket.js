import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  transports: ["websocket"], // ensures faster connection
});

socket.on("connect", () => console.log("🟢 Connected to socket server"));
socket.on("disconnect", () => console.log("🔴 Disconnected from socket"));

export default socket;
