import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: "Welcome to Skifa Kahla! I'm your AI guide. Need a fact about the place you're visting?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('map') || input.includes('fragment')) {
      return "🗺️ Map fragments are scattered throughout the fortress. Look for ancient scrolls and stone tablets. You need all 4 fragments to reveal the hidden compartment!";
    } else if (input.includes('cipher') || input.includes('wheel')) {
      return "🔤 The cipher wheel uses Ottoman encryption. Try rotating it to match the symbols you've found. Each fragment gives you a clue!";
    } else if (input.includes('hidden') || input.includes('compartment')) {
      return "🗝️ The hidden compartment will only reveal itself once you've collected all map fragments. Look for unusual wall patterns!";
    } else if (input.includes('chest') || input.includes('ottoman')) {
      return "📦 The wooden chest contains the Ottoman intelligence documents. You'll need to solve the cipher wheel first to unlock it!";
    } else if (input.includes('help') || input.includes('stuck')) {
      return "🏰 Need assistance? Try examining objects more closely, look for interactive elements, and remember - every puzzle builds on the previous one!";
    } else if (input.includes('history') || input.includes('fortress')) {
      return "🏛️ Skifa Kahla was a crucial Ottoman outpost. Its name means 'Black Hall' in Arabic. The fortress holds many secrets from the Ottoman era!";
    } else {
      return "🤔 Interesting question! I'm here to help with your fortress exploration. Ask me about puzzles, map fragments, or the history of Skifa Kahla!";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Floating chat button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white p-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          <MessageCircle size={24} />
        </button>
        <div className="absolute -top-2 -left-2">
          <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
            <Bot size={12} />
          </span>
        </div>
      </div>
    );
  }

  // Chat window
  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-2xl border border-amber-600 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Fortress Guide</h3>
              <p className="text-amber-100 text-xs">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-orange-500 hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-orange-500 hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-80 bg-gray-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-amber-100' : 'text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about puzzles, history, or get hints..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;