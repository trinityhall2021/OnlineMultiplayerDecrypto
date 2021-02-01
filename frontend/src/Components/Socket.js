import socketIOClient from "socket.io-client";

const ENDPOINT = window.origin + ":5000";
const socket = socketIOClient(ENDPOINT);

export default socket;
