// app/components/ProductQnA.js
'use client';

import { useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { BiLoaderCircle } from 'react-icons/bi';

export default function ProductQnA({ productId }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [showQnA, setShowQnA] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsAsking(true);
    setAnswer('');

    try {
      const res = await fetch('/api/ai/product-qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, question }),
      });

      if (!res.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
      setAnswer('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <button
        onClick={() => setShowQnA(!showQnA)}
        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors"
      >
        <AiOutlineQuestionCircle size={20} />
        {showQnA ? 'Hide' : 'Ask AI about this product'}
      </button>

      {showQnA && (
        <div className="mt-3 bg-gray-50 rounded-lg p-4">
          <div className="flex gap-2 mb-3">
            <textarea
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about this product..."
              rows="3"
              disabled={isAsking}
            />
          </div>
          <button
            onClick={handleAsk}
            disabled={isAsking || !question.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full"
          >
            {isAsking ? (
              <span className="flex items-center justify-center gap-2">
                <BiLoaderCircle className="animate-spin" size={18} />
                Asking AI...
              </span>
            ) : (
              'Ask AI'
            )}
          </button>

          {answer && (
            <div className="mt-4 bg-white border rounded-lg p-3">
              <div className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                <AiOutlineQuestionCircle size={16} className="text-orange-600" />
                AI Answer:
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{answer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
