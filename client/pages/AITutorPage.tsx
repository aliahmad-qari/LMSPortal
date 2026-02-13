
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Sparkles, User, Bot, ArrowLeft, MoreVertical, MessageCircle, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const AITutorPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your AI University Tutor. How can I help you with your courses today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Use gemini-3-pro-preview for complex academic reasoning and tutoring.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...messages, userMsg].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are a professional and helpful University Academic Tutor for SmartLMS. 
          Your goal is to explain complex concepts clearly, help with study plans, and answer questions about course materials.
          Current student name: ${user?.name}.
          Use Markdown for clear formatting. Always be encouraging and academic in tone.`,
        }
      });

      const aiText = response.text || "I'm sorry, I'm having trouble processing your request right now.";
      setMessages(prev => [...prev, { role: 'assistant', text: aiText }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I encountered an error while reaching my brain modules. Please check your connection or try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('dashboard')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">AI Academic Tutor</h2>
              <p className="text-indigo-200 text-xs font-medium">Powered by Gemini 3 Pro</p>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-xl">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'assistant' ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-indigo-600 text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl text-sm bg-white text-slate-400 rounded-tl-none border border-slate-100 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Generating academic insights...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 max-w-4xl mx-auto bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <div className="p-2 text-slate-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            value={input}
            disabled={isLoading}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your courses..." 
            className="flex-1 bg-transparent border-none outline-none text-sm py-2 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">SmartLMS AI uses Gemini 3 Pro. Always verify critical facts with your course instructor.</p>
      </div>
    </div>
  );
};

export default AITutorPage;
