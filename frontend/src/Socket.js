import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:5000";
const socket = socketIOClient(
  ENDPOINT,
  {query: {room_id: 'main'}});

export default socket;
