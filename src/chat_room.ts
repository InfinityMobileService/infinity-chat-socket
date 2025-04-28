export class ChatRoom {
  state: DurableObjectState;
  connections: Map<string, WebSocket>;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.connections = new Map();
  }

  async fetch(request: Request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected websocket", { status: 400 });
    }

    const [clientSocket, serverSocket] = Object.values(new WebSocketPair()) as [WebSocket, WebSocket];

    await this.handleSession(serverSocket);

    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
    });
  }

  async handleSession(socket: WebSocket) {
    const id = crypto.randomUUID();
    this.connections.set(id, socket);

    socket.accept();

    socket.addEventListener("message", (event) => {
      const message = event.data;
      this.broadcast(`${id.substring(0, 8)}: ${message}`);
    });

    socket.addEventListener("close", () => {
      this.connections.delete(id);
    });

    socket.addEventListener("error", () => {
      this.connections.delete(id);
    });
  }

  broadcast(message: string) {
    for (const [_, socket] of this.connections) {
      try {
        socket.send(message);
      } catch {
        // ignore broken sockets
      }
    }
  }
}