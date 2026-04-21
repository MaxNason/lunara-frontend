import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore, type ChatMsg } from '../store/chatStore';
import { chatApi } from '../api/dashboard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`msg-row ${isUser ? 'msg-user' : 'msg-assistant'}`}>
      <div className="msg-avatar">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className={`msg-bubble ${isUser ? '' : 'chat-markdown'}`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
        )}
        {msg.isStreaming && (
          <span className="streaming-dot">
            <Loader2 size={14} className="spin" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { token } = useAuthStore();
  const { messages, connected, connect, disconnect, sendMessage, loadHistory, clearMessages } =
    useChatStore();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (token) {
      chatApi.history().then(({ data }) => {
        if (data.length) loadHistory(data);
      }).catch(() => {});
      connect(token);
    }
    return () => disconnect();
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !connected) return;
    sendMessage(text);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    try {
      await chatApi.clearHistory();
      clearMessages();
    } catch {}
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div>
          <h2>AI Assistant</h2>
          <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
          <span className="status-text">{connected ? 'Online' : 'Connecting...'}</span>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} className="clear-btn" title="Clear history">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <Bot size={48} className="text-accent" />
            <h3>Hi! I'm your AI assistant</h3>
            <p>Try asking something like:</p>
            <div className="suggestions">
              <button onClick={() => { setInput('Find 20 leads in healthcare'); inputRef.current?.focus(); }}>
                🏥 Find 20 leads in healthcare
              </button>
              <button onClick={() => { setInput('Write an outreach email for SaaS CTOs'); inputRef.current?.focus(); }}>
                📧 Write outreach email for CTOs
              </button>
              <button onClick={() => { setInput('Analyze my campaign performance'); inputRef.current?.focus(); }}>
                📊 Analyze campaign performance
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask me anything..."
          rows={1}
          disabled={!connected}
        />
        <button onClick={handleSend} disabled={!input.trim() || !connected} className="send-btn">
          <Send size={20} />
        </button>
      </div>

      <style>{`
        .chat-page {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 48px);
          max-height: calc(100vh - 48px);
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .chat-header > div {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chat-header h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .status-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-dot.online { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
        .status-dot.offline { background: #ef4444; }
        .status-text { font-size: 0.8rem; color: var(--text-muted); }
        .clear-btn {
          background: rgba(239,68,68,0.1);
          border: none;
          color: #ef4444;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .clear-btn:hover { background: rgba(239,68,68,0.2); }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 8px 0;
        }
        .chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 12px;
          color: var(--text-secondary);
          text-align: center;
        }
        .chat-empty h3 {
          font-size: 1.2rem;
          color: var(--text-primary);
          margin: 0;
        }
        .chat-empty p {
          margin: 0;
          font-size: 0.9rem;
        }
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
          justify-content: center;
        }
        .suggestions button {
          padding: 10px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .suggestions button:hover {
          border-color: var(--accent);
          background: rgba(99,102,241,0.1);
        }

        .msg-row {
          display: flex;
          gap: 12px;
          animation: fadeIn 0.3s ease;
        }
        .msg-user { flex-direction: row-reverse; }
        .msg-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .msg-user .msg-avatar {
          background: linear-gradient(135deg, var(--accent), #818cf8);
          color: white;
        }
        .msg-assistant .msg-avatar {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          color: var(--cyan);
        }
        .msg-bubble {
          max-width: 75%;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 0.92rem;
          line-height: 1.6;
        }
        .msg-user .msg-bubble {
          background: linear-gradient(135deg, var(--accent), #818cf8);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .msg-assistant .msg-bubble {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }
        .msg-bubble p { margin: 0 0 8px; }
        .msg-bubble p:last-child { margin-bottom: 0; }
        .msg-bubble table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.85rem; }
        .msg-bubble th, .msg-bubble td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
        .msg-bubble th { background: var(--bg-tertiary); font-weight: 600; }
        .msg-bubble code { background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
        .msg-bubble pre { background: var(--bg-tertiary); padding: 12px; border-radius: 8px; overflow-x: auto; }
        .msg-bubble ul, .msg-bubble ol { padding-left: 20px; margin: 8px 0; }
        .msg-bubble a { color: var(--cyan); text-decoration: underline; }
        .streaming-dot { display: inline-flex; margin-left: 6px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .chat-input-bar {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          margin-top: 8px;
        }
        .chat-input-bar textarea {
          flex: 1;
          resize: none;
          padding: 14px 18px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 14px;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          max-height: 120px;
          transition: border-color 0.2s;
        }
        .chat-input-bar textarea:focus {
          border-color: var(--accent);
        }
        .send-btn {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--accent), #818cf8);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(99,102,241,0.4);
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
