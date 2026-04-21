import { create } from 'zustand';

export interface ChatMsg {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
}

interface ChatState {
  messages: ChatMsg[];
  connected: boolean;
  ws: WebSocket | null;
  connecting: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (text: string) => void;
  addMessage: (msg: ChatMsg) => void;
  updateLastAssistant: (content: string) => void;
  loadHistory: (msgs: ChatMsg[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  connected: false,
  ws: null,
  connecting: false,

  connect: (token: string) => {
    const state = get();
    if (state.ws || state.connecting) return;
    set({ connecting: true });

    const envWs = import.meta.env.VITE_WS_URL as string | undefined;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBase = envWs || `${protocol}//${window.location.host}`;
    const wsUrl = `${wsBase}/ws/chat`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }));
      set({ connected: true, ws, connecting: false });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const state = get();

        if (data.type === 'connected' || data.type === 'auth_ok') return;

        if (data.type === 'progress' || data.type === 'search_started') {
          const msg = data.content || data.message || '';
          const lastMsg = state.messages[state.messages.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.isStreaming) {
            set({
              messages: state.messages.map((m, i) =>
                i === state.messages.length - 1
                  ? { ...m, content: m.content + '\n' + msg }
                  : m
              ),
            });
          } else {
            set({
              messages: [
                ...state.messages,
                { role: 'assistant', content: '⏳ ' + msg, isStreaming: true },
              ],
            });
          }
          return;
        }

        if (data.type === 'search_complete') return;

        if (data.type === 'message' || data.type === 'search_result') {
          const msgs = state.messages.filter((m) => !m.isStreaming);
          set({
            messages: [...msgs, { role: 'assistant', content: data.content || data.message || '' }],
          });
          return;
        }

        if (data.type === 'error') {
          set({
            messages: [
              ...state.messages,
              { role: 'assistant', content: `❌ Error: ${data.content || data.message}` },
            ],
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      set({ connected: false, ws: null, connecting: false });
    };

    ws.onerror = () => {
      set({ connected: false, ws: null, connecting: false });
    };
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, connected: false });
    }
  },

  sendMessage: (text: string) => {
    const { ws, messages } = get();
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    set({ messages: [...messages, { role: 'user', content: text }] });
    ws.send(JSON.stringify({ type: 'message', content: text }));
  },

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  updateLastAssistant: (content) =>
    set((s) => ({
      messages: s.messages.map((m, i) =>
        i === s.messages.length - 1 && m.role === 'assistant' ? { ...m, content } : m
      ),
    })),

  loadHistory: (msgs) => set({ messages: msgs }),

  clearMessages: () => set({ messages: [] }),
}));
