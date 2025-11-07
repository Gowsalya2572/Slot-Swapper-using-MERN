import { io } from "socket.io-client";

const socket = io("https://slot-swapper-backend-six.vercel.app/api", {
  autoConnect: false,
});

socket.on("connect", () => console.log("🟢 Connected to socket server"));
socket.on("disconnect", () => console.log("🔴 Disconnected from socket"));

export default socket;
