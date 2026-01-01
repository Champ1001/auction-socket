const rooms = {};

export function createRoom(id, initialData) {
  rooms[id] = {
    state: initialData,
    clients: new Set(),

    join(ws, data) {
      this.clients.add(ws);
      ws.send(JSON.stringify({ type: "SYNC", state: this.state }));
    },

    broadcast(payload) {
      this.clients.forEach(c =>
        c.send(JSON.stringify(payload))
      );
    },

    placeBid({ userId }) {
      this.state.currentBid += 10;
      this.state.highestBidderId = userId;
      this.broadcast({ type: "BID_UPDATE", state: this.state });
    },

    chat({ text, sender }) {
      this.broadcast({ type: "CHAT", text, sender });
    }
  };
}

export function getRoom(id) {
  return rooms[id];
}
