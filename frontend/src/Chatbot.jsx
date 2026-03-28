import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `
You are the official Sales Assistant for 'Jai Mata Di Hardware'.
Your ONLY goal is to interview the user to collect 4 specific pieces of information.

STRICT RULES:
1. NEVER provide example data. NEVER make up a name, quantity, or phone number.
2. Ask for ONLY ONE piece of information at a time.
3. After the user answers one question, acknowledge it briefly and ask the NEXT question.
4. ORDER OF QUESTIONS:
   - First: Ask what Product/Material they need.
   - Second: Ask for the Quantity.
   - Third: Ask for their Name.
   - Fourth: Ask for their WhatsApp Number.

If the user asks a question about hardware, answer it briefly, then IMMEDIATELY go back to asking your current lead-gen question.
Once (and ONLY once) you have real values for all 4 items from the user, reply with exactly: ALL_DONE
`;

export default function Chatbot({ onClose, whatsappNumber }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "👋 Hi! I'm your JMD Assistant. What are you looking for today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          { role: 'user', content: userText }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
      });

      let aiResponse = chatCompletion.choices[0]?.message?.content || "";

      if (aiResponse.includes("ALL_DONE")) {
        // 1. Generate the Professional Summary
        const summaryResponse = await groq.chat.completions.create({
          messages: [
            ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
            { role: 'user', content: "Summarize this lead into one professional line for the Admin: 'Name (Phone) wants Quantity of Product'." }
          ],
          model: "llama-3.1-8b-instant",
        });

        const finalSummary = summaryResponse.choices[0]?.message?.content || "New AI Lead";
        const fullTranscript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');

        // 2. SAVE TO NEW CHATS TABLE
        await fetch('https://jai-mata-di-hardware.onrender.com/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: finalSummary,
            transcript: fullTranscript,
            customer_info: "AI Lead"
          }),
        });

        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: "Perfect! I've logged your request. You can also chat with us directly on WhatsApp below." },
          { sender: 'action_button', text: finalSummary }
        ]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      }
    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { sender: 'ai', text: "I'm having a connection hiccup. Use the 'Connect to Team' button above to chat directly!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    // 1. Find the specific message that contains our AI summary
    const summaryMsg = messages.find(m => m.sender === 'action_button');

    // 2. Use that summary, or a fallback if it's missing
    const cleanSummary = summaryMsg ? summaryMsg.text : "New Quote Request from Website";

    const text = `*New AI Lead from Website* 🚀%0A%0A*Summary:* ${encodeURIComponent(cleanSummary)}%0A%0APlease assist me!`;

    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
    onClose();
  };

  return (
    <div className="chat-widget-container">
      <div className="chat-window">
        {/* Header */}
        <div className="chat-header-premium">
          <div className="header-info">
            <div className="status-dot"></div>
            <div>
              <p className="ai-name">JMD Assistant</p>
              <p className="ai-status">Ready to help</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="connect-team-btn" onClick={handleWhatsAppRedirect}>
                Connect to Team
            </button>
            <button className="close-x" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`bubble-wrapper ${msg.sender}`}>
              {msg.sender === 'ai' && <div className="mini-avatar">J</div>}
              <div className={`msg-bubble ${msg.sender}`}>
                {msg.sender === 'action_button' ? (
                   <button onClick={handleWhatsAppRedirect} className="final-wa-btn">Send to Santosh (WhatsApp) ➔</button>
                ) : msg.text}
              </div>
            </div>
          ))}
          {isLoading && <div className="typing-indicator">Assistant is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="chat-footer-premium">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">➤</button>
        </form>
      </div>
    </div>
  );
}
