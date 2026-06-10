import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendChatMessage } from '../../api/chatApi';

const SUGGESTIONS = [
  'Đà Lạt tháng 8 còn phòng nào không?',
  'Phòng giá dưới 800k ở Đà Lạt',
  'Phòng rẻ nhất tháng này',
  'Cherry House có những thành phố nào?',
];

function linkifyText(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = String(text || '').split(urlRegex);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      const isInternal = part.includes('/booking') || part.includes('/room/') || part.includes('/properties');
      if (isInternal) {
        try {
          const u = new URL(part);
          return (
            <Link
              key={`link-${i}`}
              to={`${u.pathname}${u.search}`}
              className="font-semibold text-primary underline underline-offset-2"
            >
              Đặt phòng / xem chi tiết
            </Link>
          );
        } catch {
          /* fall through */
        }
      }
      return (
        <a
          key={`link-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary underline underline-offset-2"
        >
          {part}
        </a>
      );
    }
    return <span key={`t-${i}`}>{part}</span>;
  });
}

function ChatMessage({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'rounded-br-md bg-primary text-white'
            : 'rounded-bl-md border border-black/5 bg-white text-on-surface',
        ].join(' ')}
      >
        {!isUser ? (
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-primary">
            <span className="material-symbols-outlined text-base">smart_toy</span>
            Cherry Assistant
          </p>
        ) : null}
        <div className="whitespace-pre-wrap break-words">{linkifyText(content)}</div>
      </div>
    </div>
  );
}

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào! Tôi là trợ lý Cherry House — hỏi tôi về phòng trống, giá, thành phố và đặt phòng nhé.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSend(text) {
    const trimmed = String(text || input).trim();
    if (!trimmed || loading) return;

    setError('');
    setInput('');
    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const history = nextMessages
        .slice(0, -1)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await sendChatMessage({ message: trimmed, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const msg =
        err?.response?.data?.message
        || err?.message
        || 'Không gửi được tin nhắn. Thử lại sau.';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Xin lỗi, tôi gặp sự cố: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px] md:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={[
          'fixed z-[100] flex flex-col overflow-hidden border border-black/10 bg-surface shadow-2xl shadow-primary/15 transition-all duration-300',
          open
            ? 'bottom-0 left-0 right-0 h-[min(78vh,560px)] rounded-t-3xl md:bottom-6 md:left-auto md:right-6 md:h-[min(70vh,520px)] md:w-[min(100vw-2rem,400px)] md:rounded-3xl'
            : 'pointer-events-none bottom-0 h-0 w-0 opacity-0',
        ].join(' ')}
        role="dialog"
        aria-label="Cherry House chat assistant"
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-black/5 bg-linear-to-r from-primary to-primary/90 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <span className="material-symbols-outlined">support_agent</span>
            </span>
            <div>
              <p className="font-headline text-sm font-bold">Cherry Assistant</p>
              <p className="text-xs text-white/80">Hỏi phòng trống &amp; giá — dữ liệu thật từ hệ thống</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 hover:bg-white/15"
            aria-label="Đóng chat"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-container-low/40 px-3 py-4">
          {messages.map((m, idx) => (
            <ChatMessage key={`msg-${idx}`} role={m.role} content={m.content} />
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3 text-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Đang tra cứu phòng…
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {!messages.some((m) => m.role === 'user') ? (
          <div className="flex flex-wrap gap-2 border-t border-black/5 bg-white px-3 py-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <p className="border-t border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-700">{error}</p>
        ) : null}

        <form
          className="flex items-end gap-2 border-t border-black/5 bg-white p-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="VD: Đà Lạt 12–14/8 còn phòng nào?"
            className="max-h-24 min-h-[44px] flex-1 resize-none rounded-xl border border-outline-variant/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:brightness-110 disabled:opacity-50"
            aria-label="Gửi"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30 transition hover:scale-105 hover:brightness-110 md:bottom-6 md:right-6',
          open ? 'rotate-0' : '',
        ].join(' ')}
        aria-label={open ? 'Đóng trợ lý Cherry House' : 'Mở trợ lý Cherry House'}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-2xl">
          {open ? 'close' : 'chat'}
        </span>
      </button>
    </>
  );
}
