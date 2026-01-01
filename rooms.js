const rooms = new Map();

export function createRoom(roomId) {
  const room = {
    id: roomId,
    clients: new Set(),
    state: {
      currentBid: 0,
      highestBidder: null,
    },

    join(ws, data) {
      ws.room = room;
      ws.userId = data.userId;
      ws.team = data.team;

      room.clients.add(ws);

      // Send only essential state
      ws.send(JSON.stringify({
        type: "STATE",
        currentBid: room.state.currentBid,
        highestBidder: room.state.highestBidder,
      }));

      room.broadcast({
        type: "JOINED",
        team: ws.team,
      });
    },

    leave(ws) {
      room.clients.delete(ws);

      room.broadcast({
        type: "LEFT",
        team: ws.team,
      });
    },

    placeBid(ws, data) {
      const amount = Number(data.amount);
      if (!amount || amount <= room.state.currentBid) return;

      room.state.currentBid = amount;
      room.state.highestBidder = ws.team;

      room.broadcast({
        type: "BID",
        amount,
        team: ws.team,
      });
    },

    handleRTM(ws, data) {
      room.broadcast({
        type: "RTM",
        team: ws.team,
        action: data.action,
      });
    },

    chat(ws, data) {
      if (!data.text?.trim()) return;

      room.broadcast({
        type: "CHAT",
        team: ws.team,
        text: data.text.slice(0, 200), // limit size
      });
    },

    broadcast(payload) {
      const msg = JSON.stringify(payload);
      room.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(msg);
        }
      });
    },
  };

  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}
