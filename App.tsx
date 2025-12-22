
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ChatRoom from './components/ChatRoom';
import { User, Message, UnreadState } from './types';
import { GoogleGenAI } from "@google/genai";

const AI_BOT: User = {
  id: 'ai-bot',
  name: 'My Ai',
  email: 'ai@chatpro.com',
  avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712139.png',
  status: 'متصل الآن'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<'auth' | 'dashboard' | 'chat'>('auth');
  const [unreadCounts, setUnreadCounts] = useState<UnreadState>({});
  
  // Real Persistence using localStorage "Global Pool"
  const getGlobalUsers = (): User[] => {
    const data = localStorage.getItem('global_users');
    return data ? JSON.parse(data) : [];
  };

  const [users, setUsers] = useState<User[]>([AI_BOT]);

  useEffect(() => {
    // Load local data
    const savedUser = localStorage.getItem('active_user');
    const savedMessages = localStorage.getItem('chat_messages');
    
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCurrentUser(parsed);
      setAppState('dashboard');
    }
    if (savedMessages) setAllMessages(JSON.parse(savedMessages));
    
    // Sync users from global pool
    const syncUsers = () => {
      const pool = getGlobalUsers();
      const me = JSON.parse(localStorage.getItem('active_user') || 'null');
      const filtered = pool.filter(u => u.id !== me?.id);
      setUsers([AI_BOT, ...filtered]);
    };
    
    syncUsers();
    const interval = setInterval(syncUsers, 3000); // Check for new users every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (allMessages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(allMessages));
    }
  }, [allMessages]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('active_user', JSON.stringify(user));
    setAppState('dashboard');
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUnreadCounts(prev => ({ ...prev, [user.id]: 0 }));
    setAppState('chat');
  };

  const handleSendMessage = async (content: string, type: any, fileName?: string, replyToId?: string) => {
    if (!currentUser || !selectedUser) return;
    
    const msgId = Date.now().toString();
    const msg: Message = {
      id: msgId,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content,
      type,
      fileName,
      timestamp: Date.now(),
      replyTo: replyToId
    };

    setAllMessages(prev => [...prev, msg]);
    playNotificationSound('send');

    // AI Logic
    if (selectedUser.id === 'ai-bot' && type === 'text') {
      triggerAIResponse(content);
    }
  };

  const triggerAIResponse = async (userPrompt: string) => {
    try {
      // Simulate typing
      setUsers(prev => prev.map(u => u.id === 'ai-bot' ? { ...u, isTyping: true } : u));
      
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userPrompt,
        config: { systemInstruction: "أنت صديق ذكي ومرح في تطبيق ChatPro. اسمك My Ai. ردودك قصيرة وجذابة بالعربي." }
      });

      const aiText = response.text || "عذراً، لم أفهم ذلك جيداً!";
      
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        senderId: 'ai-bot',
        receiverId: currentUser!.id,
        content: aiText,
        type: 'text',
        timestamp: Date.now()
      };

      setTimeout(() => {
        setAllMessages(prev => [...prev, aiMsg]);
        setUsers(prev => prev.map(u => u.id === 'ai-bot' ? { ...u, isTyping: false } : u));
        playNotificationSound('receive');
      }, 1500);

    } catch (e) {
      console.error(e);
      setUsers(prev => prev.map(u => u.id === 'ai-bot' ? { ...u, isTyping: false } : u));
    }
  };

  const playNotificationSound = (type: 'send' | 'receive') => {
    const src = type === 'send' 
      ? 'https://www.soundjay.com/buttons/sounds/button-16.mp3' 
      : 'https://www.soundjay.com/buttons/sounds/button-3.mp3';
    new Audio(src).play().catch(() => {});
  };

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden">
      {appState === 'auth' && <Auth onLogin={handleLogin} />}
      
      {appState === 'dashboard' && currentUser && (
        <Dashboard 
          currentUser={currentUser}
          users={users}
          unreadCounts={unreadCounts}
          onSelectUser={handleSelectUser}
          onLogout={() => { 
            localStorage.removeItem('active_user'); 
            setCurrentUser(null); 
            setAppState('auth'); 
          }}
        />
      )}

      {appState === 'chat' && currentUser && selectedUser && (
        <ChatRoom 
          currentUser={currentUser}
          targetUser={users.find(u => u.id === selectedUser.id) || selectedUser}
          messages={allMessages.filter(m => 
            (m.senderId === currentUser.id && m.receiverId === selectedUser.id) ||
            (m.senderId === selectedUser.id && m.receiverId === currentUser.id)
          )}
          onBack={() => setAppState('dashboard')}
          onSendMessage={handleSendMessage}
          onDeleteMessage={(id) => setAllMessages(prev => prev.filter(m => m.id !== id))}
          onToggleLike={(id) => setAllMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m))}
          allUsers={users}
        />
      )}
    </div>
  );
};

export default App;
