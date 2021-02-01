import socketIOClient from "socket.io-client";

const ENDPOINT = window.origin.location+":5000";
const socket = socketIOClient(ENDPOINT);

export default socket;
