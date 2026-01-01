import { WebSocketServer } from "ws";
import { createRoom, getRoom } from "./rooms.js";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg);

    const room = getRoom(data.roomId);
    if (!room) return;

    switch (data.type) {
      case "JOIN":
        room.join(ws, data);
        break;

      case "BID":
        room.placeBid(data);
        break;

      case "RTM":
        room.handleRTM(data);
        break;

      case "CHAT":
        room.chat(data);
        break;
    }
  });
});

console.log("WebSocket running on :8080");
