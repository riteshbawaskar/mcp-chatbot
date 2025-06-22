import { useRef, useState, useEffect } from 'react';
import './index.css';

const EXAMPLES = [
  'Show me open defects in alpha',
  'What is the current sprint status for beta?',
  'List all closed bugs in gamma',
  'Give me defect count for last sprint'
];

function App() {

  const [userInput, setUserInput] = useState('');
  const [chatLog, setChatLog] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (input = userInput) => {
    if (!input.trim()) return;

    setChatLog((log) => [...log, { type: 'user', text: input }]);

    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();

      console.log("response from server : ", data);

      const summary = data.response.message || 'Processing...';
      setChatLog((log) => [...log, { type: 'bot', text: summary }]);

      if (data.response.intent) {
        setChatLog((log) => [
          ...log,
          { type: 'bot', text: '📊 Stats:' },
          { type: 'bot', text: JSON.stringify(data.response, null, 2) }
        ]);
      }
    } catch (err) {
      setChatLog((log) => [...log, { type: 'bot', text: '⚠️ Error fetching data' }]);
    }

    setUserInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-gray-100 rounded-md p-4 h-[60vh] overflow-y-auto shadow-inner space-y-3">
        {chatLog.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-4 py-2 rounded-md text-sm whitespace-pre-wrap ${
              msg.type === 'user'
                ? 'bg-blue-100 self-end text-blue-800 ml-auto'
                : 'bg-white text-gray-800'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 text-sm text-gray-600">Try one of these:</div>
      <div className="flex flex-wrap gap-2 mt-1">
        {EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(ex)}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about a project..."
          className="flex-1 p-2 border rounded shadow-sm"
        />
        <button
          onClick={() => sendMessage()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );

}

export default App;
