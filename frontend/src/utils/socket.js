import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:4000" || "https://slot-swapper-backend-six.vercel.app/api", {
  autoConnect: false,
});

socket.on("connect", () => console.log("🟢 Connected to socket server"));
socket.on("disconnect", () => console.log("🔴 Disconnected from socket"));

export default socket;
