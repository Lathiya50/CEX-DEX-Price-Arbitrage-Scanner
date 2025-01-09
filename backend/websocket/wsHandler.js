// websocket/wsHandler.js
import WebSocket from "ws";

let clients = new Set();

export const initializeWebSocket = (wss) => {
  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    });

    ws.on("close", () => {
      clients.delete(ws);
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    });
  });
};

export const broadcastToClients = (data) => {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const handleWebSocketMessage = (ws, data) => {
  switch (data.type) {
    case "SUBSCRIBE_PAIR":
      // Handle pair subscription
      break;
    case "UNSUBSCRIBE_PAIR":
      // Handle pair unsubscription
      break;
    default:
      console.log("Unknown message type:", data.type);
  }
};
