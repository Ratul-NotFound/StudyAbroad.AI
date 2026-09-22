/**
 * StudyAbroad.AI — Socket.io React Hook
 * Connects to the Node.js scraper service for real-time agent updates.
 * Falls back gracefully if the scraper service is offline.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SCRAPER_SERVICE_URL = process.env.NEXT_PUBLIC_SCRAPER_URL ?? "http://localhost:3001";

export type AgentUpdate = {
  agent: string;
  status: "started" | "running" | "completed" | "failed";
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
};

export type ScraperProgress = {
  url: string;
  progress: number;
  found: number;
  total: number;
};

interface UseSocketReturn {
  connected: boolean;
  agentUpdates: AgentUpdate[];
  scraperProgress: ScraperProgress | null;
  emit: (event: string, data: unknown) => void;
  clearUpdates: () => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [agentUpdates, setAgentUpdates] = useState<AgentUpdate[]>([]);
  const [scraperProgress, setScraperProgress] = useState<ScraperProgress | null>(null);

  useEffect(() => {
    const socket = io(SCRAPER_SERVICE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("[Socket] Connected to scraper service");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("[Socket] Disconnected from scraper service");
    });

    socket.on("connect_error", () => {
      setConnected(false);
    });

    socket.on("agent:update", (update: AgentUpdate) => {
      setAgentUpdates((prev) => [update, ...prev].slice(0, 50)); // keep last 50
    });

    socket.on("scraper:progress", (progress: ScraperProgress) => {
      setScraperProgress(progress);
    });

    socket.on("scraper:completed", () => {
      setScraperProgress(null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const clearUpdates = useCallback(() => {
    setAgentUpdates([]);
  }, []);

  return { connected, agentUpdates, scraperProgress, emit, clearUpdates };
}

/**
 * Hook for subscribing to a specific agent's updates only.
 */
export function useAgentSocket(agentName: string) {
  const { agentUpdates, ...rest } = useSocket();
  const filtered = agentUpdates.filter((u) => u.agent === agentName);
  return { ...rest, agentUpdates: filtered };
}
