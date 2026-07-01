import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Bot, Send, Loader2, User, Sparkles } from 'lucide-react';

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am ERP-Bot, your AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/ai/ask`;

  const suggestedPrompts = [
    "Show students with attendance below 75%",
    "Generate the CSE department attendance report",
    "How many books are overdue?",
    "Create a timetable for Semester 3",
    "Summarize fee collection this month"
  ];

  const handleSendPrompt = async (promptText) => {
    if (!promptText.trim()) return;

    const userMessage = { role: 'user', content: promptText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(API_URL, { prompt: userMessage.content }, config);
      
      const botMessage = { role: 'assistant', content: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = { role: 'assistant', content: "Oops! The AI Assistant is temporarily unavailable. Please try again later or contact support if the issue persists." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    handleSendPrompt(input);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50 shrink-0">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">ERP-Bot</h2>
          <p className="text-xs text-slate-500">Powered by Groq Llama3</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            
            <div className={`px-4 py-3 rounded-2xl max-w-[75%] ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        {/* Suggested Prompts */}
        {messages.length < 3 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3" /> Suggested Prompts
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendPrompt(prompt)}
                  className="text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ERP-Bot anything..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 text-slate-800"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-primary text-white p-3 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;
