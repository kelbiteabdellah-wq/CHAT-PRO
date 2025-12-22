
import React, { useState, useRef, useEffect } from 'react';
import { User, Message, MessageType } from '../types';

interface ChatRoomProps {
  currentUser: User;
  targetUser: User;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (c: string, t: MessageType, f?: string, r?: string) => void;
  onDeleteMessage: (id: string) => void;
  onToggleLike: (id: string) => void;
  allUsers: User[];
}

const ChatRoom: React.FC<ChatRoomProps> = ({ currentUser, targetUser, messages, onBack, onSendMessage, onDeleteMessage, onToggleLike, allUsers }) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [viewingMedia, setViewingMedia] = useState<Message | null>(null);
  const [viewingUserInfo, setViewingUserInfo] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ msg: Message, x: number, y: number } | null>(null);
  const [sharingMsg, setSharingMsg] = useState<Message | null>(null);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // التمرير التلقائي للأسفل عند وصول رسائل جديدة أو بدء الكتابة
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, replyingTo, targetUser.isTyping]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText, 'text', undefined, replyingTo?.id);
      setInputText('');
      setReplyingTo(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type: MessageType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
      const reader = new FileReader();
      reader.onloadend = () => {
        onSendMessage(reader.result as string, type, file.name, replyingTo?.id);
        setReplyingTo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyMessage = (msg: Message) => {
    navigator.clipboard.writeText(msg.content).then(() => {
       setContextMenu(null);
    });
  };

  const handleLongPress = (e: any, msg: Message) => {
    e.preventDefault();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setContextMenu({ msg, x, y });
  };

  const confirmDelete = () => {
    if (deletingMsgId) {
      onDeleteMessage(deletingMsgId);
      setDeletingMsgId(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl bg-[#f0f2f5] md:shadow-2xl md:rounded-[2.5rem] overflow-hidden relative">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-4 border-b flex items-center gap-3 z-10 sticky top-0">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
          <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingUserInfo(true)}>
          <img src={targetUser.avatar} className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shadow-sm" alt="Avatar" />
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">{targetUser.name}</h3>
            <p className={`text-[10px] font-bold ${targetUser.isTyping ? 'text-blue-500 animate-pulse' : 'text-green-500'}`}>
               {targetUser.isTyping ? 'يكتب الآن...' : targetUser.status}
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {messages.map(msg => {
          const isMe = msg.senderId === currentUser.id;
          const senderName = isMe ? 'أنت' : targetUser.name;
          const replyMsg = messages.find(m => m.id === msg.replyTo);
          
          return (
            <div key={msg.id} className={`flex flex-col animate-message-in ${isMe ? 'items-start' : 'items-end'}`}>
              <span className="text-[10px] text-slate-400 mb-1 px-3 font-semibold">{senderName}</span>
              <div 
                onContextMenu={(e) => handleLongPress(e, msg)}
                className={`message-bubble relative group max-w-[85%] p-3.5 rounded-3xl shadow-sm cursor-pointer select-none
                  ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}
                `}
              >
                {replyMsg && (
                  <div className={`mb-2 p-3 bg-black/5 rounded-2xl border-r-4 border-blue-400 text-[11px] leading-relaxed italic
                     ${isMe ? 'text-blue-50' : 'text-slate-500'}
                  `}>
                    <span className="block font-bold mb-0.5">في الرد على:</span>
                    {replyMsg.type === 'text' ? replyMsg.content.substring(0, 50) + '...' : `[${replyMsg.type}]`}
                  </div>
                )}
                {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                {msg.type === 'image' && <img src={msg.content} onClick={() => setViewingMedia(msg)} className="rounded-2xl max-h-72 w-full object-cover border border-black/5" />}
                {msg.type === 'video' && <video src={msg.content} controls className="rounded-2xl max-h-72 w-full border border-black/5" />}
                {msg.type === 'file' && (
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl border border-white/20">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>
                    </div>
                    <span className="text-xs font-bold truncate max-w-[120px]">{msg.fileName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-[9px] opacity-60 font-bold">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.liked && <span className="bg-white/90 p-1 rounded-full shadow-sm text-[10px] -mb-4 -mr-2 animate-in zoom-in">❤️</span>}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator داخل الشات */}
        {targetUser.isTyping && (
          <div className="flex flex-col items-end animate-message-in duration-300">
            <span className="text-[10px] text-slate-400 mb-1 px-3 font-semibold">{targetUser.name}</span>
            <div className="bg-white text-slate-800 p-4 rounded-3xl rounded-bl-none shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white p-4 border-t sticky bottom-0">
        {replyingTo && (
          <div className="mb-3 p-3 bg-blue-50 border-r-4 border-blue-600 rounded-2xl flex justify-between items-center text-xs animate-in slide-in-from-bottom duration-200">
            <div className="truncate">
               <span className="block font-bold text-blue-600 mb-0.5">رد على {replyingTo.senderId === currentUser.id ? 'نفسك' : targetUser.name}</span>
               <span className="text-slate-500">{replyingTo.type === 'text' ? replyingTo.content : 'محتوى وسائط'}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-2 bg-white rounded-full shadow-sm text-red-500 hover:scale-110 transition-transform">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-100 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,video/*,application/pdf" />
          <input 
            className="flex-1 bg-slate-100 px-6 py-4 rounded-[1.5rem] outline-none text-sm focus:ring-2 focus:ring-blue-500 transition-all border-none" 
            placeholder="اكتب رسالتك هنا..." 
            value={inputText} 
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={!inputText.trim()} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-100 disabled:bg-slate-300 disabled:shadow-none hover:scale-105 active:scale-95 transition-all">
            <svg className="w-6 h-6 rotate-180" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
          </button>
        </div>
      </div>

      {/* Menus / Modals */}
      {contextMenu && (
        <div className="fixed inset-0 z-[100] bg-black/5" onClick={() => setContextMenu(null)}>
          <div 
            style={{ top: Math.min(contextMenu.y, window.innerHeight - 250), left: Math.min(contextMenu.x, window.innerWidth - 180) }}
            className="absolute bg-white/95 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-3xl p-2 w-44 animate-in zoom-in duration-200 border border-slate-100"
          >
            <button onClick={() => { onToggleLike(contextMenu.msg.id); setContextMenu(null); }} className="w-full text-right p-3 hover:bg-slate-50 rounded-2xl flex items-center gap-3 transition-colors">
              <span className="text-xl">❤️</span> <span className="font-bold text-sm">{contextMenu.msg.liked ? 'إلغاء' : 'أعجبني'}</span>
            </button>
            <button onClick={() => { setReplyingTo(contextMenu.msg); setContextMenu(null); }} className="w-full text-right p-3 hover:bg-slate-50 rounded-2xl flex items-center gap-3 transition-colors">
              <span className="text-xl">↩️</span> <span className="font-bold text-sm">رد</span>
            </button>
            <button onClick={() => handleCopyMessage(contextMenu.msg)} className="w-full text-right p-3 hover:bg-slate-50 rounded-2xl flex items-center gap-3 transition-colors">
              <span className="text-xl">📋</span> <span className="font-bold text-sm">نسخ</span>
            </button>
            <button onClick={() => { setSharingMsg(contextMenu.msg); setContextMenu(null); }} className="w-full text-right p-3 hover:bg-slate-50 rounded-2xl flex items-center gap-3 transition-colors">
              <span className="text-xl">🚀</span> <span className="font-bold text-sm">مشاركة</span>
            </button>
            <div className="my-1 border-t border-slate-100"></div>
            <button onClick={() => { setDeletingMsgId(contextMenu.msg.id); setContextMenu(null); }} className="w-full text-right p-3 hover:bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 transition-colors">
               <span className="text-xl">🗑️</span> <span className="font-bold text-sm">حذف</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMsgId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300 text-center border border-slate-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">حذف الرسالة؟</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">هل أنت متأكد من رغبتك في حذف هذه الرسالة؟ سيتم مسحها نهائياً ولا يمكن استعادتها.</p>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95">حذف</button>
              <button onClick={() => setDeletingMsgId(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95">تراجع</button>
            </div>
          </div>
        </div>
      )}

      {sharingMsg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl scale-95 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">مشاركة الرسالة مع</h2>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
              {allUsers.filter(u => u.id !== currentUser.id).map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" />
                    <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      btn.innerText = 'جاري المشاركة...';
                      btn.disabled = true;
                      setTimeout(() => {
                        btn.innerText = 'تمت المشاركة ✅';
                        onSendMessage(`[تمت مشاركة هذا معك من قبل ${currentUser.name}]\n${sharingMsg.content}`, sharingMsg.type, sharingMsg.fileName);
                      }, 2000);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:bg-green-500"
                  >
                    مشاركة
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setSharingMsg(null)} className="w-full mt-8 py-3 bg-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">إغلاق</button>
          </div>
        </div>
      )}

      {viewingMedia && (
        <div className="fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="absolute top-8 right-8 text-white text-right">
             <h2 className="text-xl font-bold">{viewingMedia.senderId === currentUser.id ? 'أنت' : targetUser.name}</h2>
             <span className="text-sm opacity-60 font-bold">{new Date(viewingMedia.timestamp).toLocaleString('ar-EG')}</span>
          </div>
          <button onClick={() => setViewingMedia(null)} className="absolute top-8 left-8 bg-white/10 hover:bg-white/20 p-4 rounded-full text-white backdrop-blur-md transition-all">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </button>
          <div className="max-w-full max-h-[80vh]">
            {viewingMedia.type === 'image' ? (
              <img src={viewingMedia.content} className="w-full h-full object-contain rounded-2xl shadow-2xl" />
            ) : (
              <video src={viewingMedia.content} controls autoPlay className="w-full h-full rounded-2xl shadow-2xl" />
            )}
          </div>
        </div>
      )}

      {viewingUserInfo && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[400] flex flex-col items-center p-12 animate-in slide-in-from-bottom duration-500">
           <button onClick={() => setViewingUserInfo(false)} className="self-end p-4 bg-slate-100 rounded-full text-slate-500 mb-12 hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
           </button>
           <img src={targetUser.avatar} className="w-40 h-40 rounded-[3rem] border-8 border-white shadow-2xl mb-8 object-cover" />
           <h2 className="text-3xl font-bold text-slate-900 mb-2">{targetUser.name}</h2>
           <p className="text-green-500 font-bold mb-10 text-lg">{targetUser.status}</p>
           
           <div className="w-full max-w-md space-y-4">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                 <span className="text-slate-400 font-bold">البريد الإلكتروني</span>
                 <span className="font-bold text-slate-800">{targetUser.email}</span>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                 <span className="text-slate-400 font-bold">المعرف</span>
                 <span className="font-bold text-slate-800 font-mono">#{targetUser.id.toUpperCase()}</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
