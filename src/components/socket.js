// frontend/src/socket.js
import { io } from "socket.io-client";
const socket = io('http://localhost:5000'); // o IP de tu servidor
export default socket;
