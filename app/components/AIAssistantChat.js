// app/components/AIAssistantChat.js
'use client';

import { useState } from 'react';
import { AiOutlineClose, AiOutlineMessage } from 'react-icons/ai';

export default function AIAssistantChat({ cartProductIds = [] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const nextMessages = [...messages, { role: 'user', content: input }];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, cartProductIds }),
      });
      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();
      setMessages([...nextMessages, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-colors"
          title="AI Shopping Assistant"
        >
          <AiOutlineMessage size={24} />
          <span className="font-semibold">Ask Magic Assistant</span>
        </button>
      ) : (
        <div className="bg-white shadow-2xl border rounded-lg w-96 max-h-[70vh] flex flex-col">
          <div className="px-4 py-3 border-b bg-orange-600 text-white rounded-t-lg flex items-center justify-between">
            <div className="font-semibold text-sm flex items-center gap-2">
              <AiOutlineMessage size={20} />
              MagicCommerce AI Assistant
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-orange-700 p-1 rounded transition-colors"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 text-sm space-y-3">
            {messages.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                <AiOutlineMessage size={48} className="mx-auto mb-2 text-gray-300" />
                <p className="font-semibold">Hi! How can I help you today?</p>
                <p className="text-xs mt-2">
                  Ask me about products, deals, or recommendations!
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={
                    'inline-block px-3 py-2 rounded-lg max-w-[85%] ' +
                    (m.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="text-left">
                <div className="inline-block px-3 py-2 rounded-lg bg-gray-100 text-gray-500">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div className="px-3 py-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about products, deals..."
              disabled={isSending}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
