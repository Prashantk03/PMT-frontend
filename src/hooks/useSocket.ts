import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket(boardId: string | undefined, onMessage: (event: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const token = localStorage.getItem("access_token");
    const socket = io("http://localhost:3000", {
      auth: { token },
    });

    socketRef.current = socket;

    // Join board-specific room
    socket.emit("joinBoard", boardId);

    // Listen for updates
    socket.on("taskUpdate", (data) => {
      if (data.boardId === boardId) {
        onMessage({ type: "task", ...data });
      }
    });

    socket.on("commentUpdate", (data) => {
      if (data.boardId === boardId) {
        onMessage({ type: "comment", ...data });
      }
    });

    return () => {
      socket.emit("leaveBoard", boardId);
      socket.disconnect();
    };
  }, [boardId]);

  return socketRef.current;
}

