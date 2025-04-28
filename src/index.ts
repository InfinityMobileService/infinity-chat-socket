import { ChatRoom } from './chat_room';

// Your existing code
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const roomName = url.searchParams.get("room") || "default";

    const id = env.CHAT_ROOM.idFromName(roomName);
    const stub = env.CHAT_ROOM.get(id);

    return stub.fetch(request);
  }
};

// 👇 Add this line to fix the error
export { ChatRoom };

export interface Env {
  CHAT_ROOM: DurableObjectNamespace;
}
