import { WebSocketServer } from "ws";
import { createRoom, getRoom } from "./rooms.js";

const PORT = process.env.PORT || 8080;

// WebSocket Server
const wss = new WebSocketServer({ port: PORT });

console.log("✅ WebSocket server starting...");

// Handle connections
wss.on("connection", (ws) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (e) {
      console.error("❌ Invalid JSON:", message.toString());
      return;
    }

    const { type, roomId } = data;
    if (!roomId) return;

    let room = getRoom(roomId);

    // Create room if not exists (only on JOIN)
    if (!room && type === "JOIN") {
      room = createRoom(roomId);
    }

    if (!room) return;

    switch (type) {
      case "JOIN":
        room.join(ws, data);
        break;

      case "BID":
        room.placeBid(ws, data);
        break;

      case "RTM":
        room.handleRTM(ws, data);
        break;

      case "CHAT":
        room.chat(ws, data);
        break;

      default:
        console.warn("⚠️ Unknown type:", type);
    }
  });

  ws.on("close", () => {
    if (ws.room) {
      ws.room.leave(ws);
    }
  });
});

// 🔁 Heartbeat (keeps Render happy)
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

console.log(`🚀 WebSocket running on port ${PORT}`);
