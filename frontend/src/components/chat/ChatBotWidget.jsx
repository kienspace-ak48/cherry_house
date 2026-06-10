import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchChatConfig, sendChatMessage } from '../../api/chatApi';
import { isClientLoggedIn } from '../../lib/authStorage';

const ASSISTANT_AVATAR_SRC = '/chat/assistant-avatar.png';

function AssistantAvatar({ size = 'md', className = '' }) {
  const box =
    size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-14 w-14' : 'h-9 w-9';
  return (
    <img
      src={ASSISTANT_AVATAR_SRC}
      alt=""
      className={[
        box,
        'shrink-0 rounded-full object-cover ring-2 ring-white/80',
        className,
      ].join(' ')}
      width={size === 'lg' ? 56 : size === 'sm' ? 28 : 36}
      height={size === 'lg' ? 56 : size === 'sm' ? 28 : 36}
      decoding="async"
    />
  );
}

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

function ChatMessage({ role, content, assistantName }) {
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
            <AssistantAvatar size="sm" className="ring-primary/20" />
            {assistantName}
          </p>
        ) : null}
        <div className="whitespace-pre-wrap break-words">{linkifyText(content)}</div>
      </div>
    </div>
  );
}

const FALLBACK_CONFIG = {
  assistantName: 'Cherry Assistant',
  welcomeMessage:
    'Xin chào! Tôi là trợ lý Cherry House — hỏi tôi về phòng trống, giá, thành phố và đặt phòng nhé.',
  isEnabled: true,
};

function ChatLoginGate({ loginHref, assistantName, onClose }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center">
      <AssistantAvatar size="lg" className="ring-primary/20" />
      <div>
        <p className="font-headline text-base font-bold text-on-surface">Đăng nhập để chat với {assistantName}</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Trợ lý AI chỉ hỗ trợ thành viên đã đăng nhập — hỏi phòng trống, giá và gợi ý đặt phòng từ dữ liệu thật.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Link
          to={loginHref}
          onClick={onClose}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:brightness-110"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          onClick={onClose}
          className="rounded-xl border border-primary/25 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
        >
          Đăng ký tài khoản
        </Link>
      </div>
    </div>
  );
}

export default function ChatBotWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [config, setConfig] = useState(FALLBACK_CONFIG);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: FALLBACK_CONFIG.welcomeMessage },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authTick, setAuthTick] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const loginHref = useMemo(
    () => `/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`,
    [location.pathname, location.search],
  );

  const loggedIn = useMemo(
    () => isClientLoggedIn(),
    [location.pathname, location.search, location.key, authTick],
  );

  useEffect(() => {
    function refreshAuthState() {
      setAuthTick((tick) => tick + 1);
    }
    window.addEventListener('focus', refreshAuthState);
    window.addEventListener('storage', refreshAuthState);
    return () => {
      window.removeEventListener('focus', refreshAuthState);
      window.removeEventListener('storage', refreshAuthState);
    };
  }, []);

  useEffect(() => {
    if (!loggedIn) return undefined;

    let cancelled = false;
    fetchChatConfig()
      .then((data) => {
        if (cancelled || !data) return;
        const welcomeMessage = data.welcomeMessage || FALLBACK_CONFIG.welcomeMessage;
        setConfig({
          assistantName: data.assistantName || FALLBACK_CONFIG.assistantName,
          welcomeMessage,
          isEnabled: data.isEnabled !== false,
        });
        setMessages([{ role: 'assistant', content: welcomeMessage }]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open && loggedIn) inputRef.current?.focus();
  }, [open, loggedIn]);

  async function handleSend(text) {
    if (!loggedIn) {
      navigate(loginHref);
      return;
    }

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
      if (err?.response?.status === 401) {
        setAuthTick((tick) => tick + 1);
        navigate(loginHref);
        return;
      }
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

  if (!config.isEnabled) return null;

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
            <AssistantAvatar className="ring-white/40" />
            <div>
              <p className="font-headline text-sm font-bold">{config.assistantName}</p>
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

        {loggedIn ? (
          <>
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-container-low/40 px-3 py-4">
              {messages.map((m, idx) => (
                <ChatMessage
                  key={`msg-${idx}`}
                  role={m.role}
                  content={m.content}
                  assistantName={config.assistantName}
                />
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3 text-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      Đang trả lời…
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
          </>
        ) : (
          <ChatLoginGate
            loginHref={loginHref}
            assistantName={config.assistantName}
            onClose={() => setOpen(false)}
          />
        )}
      </div>

      {!open ? (
        <div className="chat-fab-anchor fixed bottom-5 right-5 z-[90] h-14 w-14 md:bottom-6 md:right-6">
          <span className="chat-fab-ripple-ring" aria-hidden />
          <span className="chat-fab-ripple-ring chat-fab-ripple-ring--delay" aria-hidden />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="chat-fab-launcher relative z-10 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-primary/30 transition hover:scale-105 hover:ring-primary/50"
            aria-label="Mở trợ lý Cherry House"
            aria-expanded={false}
          >
            <AssistantAvatar size="lg" className="h-full w-full ring-0" />
          </button>
        </div>
      ) : null}
    </>
  );
}
