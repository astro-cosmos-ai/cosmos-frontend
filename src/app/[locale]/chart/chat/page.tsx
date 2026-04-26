'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { useChatHistory } from '@/lib/query/chat';
import { streamChat } from '@/lib/api/chat-stream';
import { getStoredChartId } from '../page';
import type { ChatMessage } from '@/lib/api/types';

export default function ChatPage() {
  const t = useTranslations('chatPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
  } = useChatHistory(chartId ?? undefined);

  // Seed messages from history on first load
  useEffect(() => {
    if (history && messages.length === 0) {
      setMessages(history);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || !chartId || streaming) return;

    setInput('');
    setStreamError(null);

    // Cancel any previous in-flight stream, then arm a fresh controller
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Optimistic user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Placeholder assistant message that we'll fill in via streaming
    const assistantPlaceholder: ChatMessage = {
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);
    setStreaming(true);

    try {
      for await (const chunk of streamChat(chartId, text, controller.signal)) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
          }
          return updated;
        });
      }
    } catch {
      setStreamError(tc('errorMessage'));
      // Remove empty assistant placeholder on error
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.role === 'assistant' && updated[updated.length - 1].content === '') {
          updated.pop();
        }
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }, [input, chartId, streaming, tc]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <>
      <div className="sky-bg" aria-hidden="true" />
      <Nav />
      <main
        className="page fade-in"
        style={{
          paddingTop: 40,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
        }}
      >
        {/* Page header */}
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 24, flexShrink: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{t('eyebrow')}</div>
          <h1 className="serif" style={{ marginBottom: 0 }}>{t('title')}</h1>
        </div>

        {/* Loading history */}
        {(!hydrated || historyLoading) && (
          <div className="dim" style={{ textAlign: 'center', paddingTop: 60, flex: 1 }}>
            {tc('loadingMessage')}
          </div>
        )}

        {/* History error */}
        {hydrated && historyError && (
          <p role="alert" style={{ color: 'var(--negative)', textAlign: 'center', paddingTop: 60, flex: 1 }}>
            {tc('errorMessage')}
          </p>
        )}

        {hydrated && !historyLoading && (
          <>
            {/* Message list */}
            <div
              role="log"
              aria-label={t('messageLog')}
              aria-live="polite"
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                paddingBottom: 16,
                paddingRight: 4,
              }}
            >
              {messages.length === 0 && !streaming && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 60,
                  }}
                >
                  <p className="muted" style={{ fontSize: 14, textAlign: 'center', maxWidth: 360 }}>
                    {t('emptyState')}
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '72%',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user'
                        ? 'var(--accent)'
                        : 'var(--bg-elev)',
                      color: msg.role === 'user'
                        ? 'var(--accent-fg)'
                        : 'var(--ink)',
                      border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                      fontSize: 14,
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content || (
                      // Streaming cursor for empty in-progress assistant message
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 14,
                          background: 'var(--ink-muted)',
                          borderRadius: 2,
                          animation: 'pulse 1s infinite',
                        }}
                        aria-label={t('typing')}
                      />
                    )}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            {/* Stream error */}
            {streamError && (
              <p role="alert" style={{ color: 'var(--negative)', fontSize: 13, marginBottom: 8, flexShrink: 0 }}>
                {streamError}
              </p>
            )}

            {/* Input area */}
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                {t('inputLabel')}
              </label>
              <textarea
                id="chat-input"
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={t('inputPlaceholder')}
                disabled={streaming || !chartId}
                rows={1}
                className="focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
                style={{
                  flex: 1,
                  resize: 'none',
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  color: 'var(--ink)',
                  padding: '10px 14px',
                  fontSize: 14,
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  opacity: streaming || !chartId ? 0.6 : 1,
                }}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={streaming || !input.trim() || !chartId}
                aria-label={t('sendButton')}
                style={{
                  flexShrink: 0,
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: streaming || !input.trim() || !chartId
                    ? 'var(--bg-elev)'
                    : 'var(--accent)',
                  color: streaming || !input.trim() || !chartId
                    ? 'var(--ink-muted)'
                    : 'var(--accent-fg)',
                  border: '1px solid var(--border)',
                  cursor: streaming || !input.trim() || !chartId ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {streaming ? '…' : '↑'}
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
