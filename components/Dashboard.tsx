
import React, { useState } from 'react';
import { User, UnreadState } from '../types';

interface DashboardProps {
  currentUser: User;
  users: User[];
  unreadCounts: UnreadState;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, users, unreadCounts, onSelectUser, onLogout }) => {
  const [search, setSearch] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'info' | 'logout'>('profile');

  // Logic: Show AI + Other real users (not me)
  const filtered = users.filter(u => u.id !== currentUser.id && u.name.includes(search));

  return (
    <div className="relative flex flex-col h-full w-full max-w-lg bg-white md:shadow-[0_20px_50px_rgba(0,0,0,0.1)] md:rounded-[2.5rem] overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
          <div className="relative">
            <img src={currentUser.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100" alt="Me" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-slate-800 leading-none">{currentUser.name}</h2>
            <span className="text-[10px] text-slate-400">متصل الآن</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl text-blue-600">
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.59.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/></svg>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <input 
            type="text" placeholder="ابحث في الدردشات..."
            className="w-full bg-slate-100 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in slide-in-from-bottom duration-700">
            <div className="w-48 h-48 animate-float mb-6">
               <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 20C55.8 20 20 55.8 20 100C20 144.2 55.8 180 100 180C144.2 180 180 144.2 180 100C180 55.8 144.2 20 100 20ZM100 160C66.9 160 40 133.1 40 100C40 66.9 66.9 40 100 40C133.1 40 160 66.9 160 100C160 133.1 133.1 160 100 160Z" fill="#E2E8F0"/>
                  <circle cx="100" cy="100" r="30" fill="#E2E8F0"/>
                  <path d="M100 80L120 100L100 120L80 100L100 80Z" fill="#CBD5E1"/>
               </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">لا توجد دردشات بعد</h3>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">بانتظار مستخدمين جدد للتواصل معهم، أو تحدث مع My Ai لتجربة ميزاتنا!</p>
          </div>
        ) : (
          <div className="px-2">
            {filtered.map(user => (
              <div 
                key={user.id} onClick={() => onSelectUser(user)}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer rounded-3xl transition-all mx-2"
              >
                <div className="relative">
                  <img src={user.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" alt={user.name} />
                  {unreadCounts[user.id] > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                      {unreadCounts[user.id]}
                    </span>
                  )}
                </div>
                <div className="flex-1 border-b border-slate-50 pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800">{user.name}</h3>
                    <span className="text-[10px] text-slate-400">الآن</span>
                  </div>
                  <p className={`text-xs mt-1 truncate ${user.isTyping ? 'text-blue-500 font-bold' : 'text-slate-500'}`}>
                    {user.isTyping ? 'يكتب الآن...' : (user.id === 'ai-bot' ? 'تحدث معي!' : user.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Profile Modal */}
      {showProfile && (
        <div className="absolute inset-0 bg-slate-900/40 z-50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-[85%] h-full shadow-2xl animate-in slide-in-from-left duration-500 flex">
             {/* Tabs */}
             <div className="w-20 bg-slate-50 flex flex-col items-center py-10 gap-8 border-l border-slate-100">
                <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>
                </button>
                <button onClick={() => setActiveTab('info')} className={`p-3 rounded-2xl transition-all ${activeTab === 'info' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>
                </button>
                <button onClick={() => setActiveTab('logout')} className={`p-3 rounded-2xl transition-all ${activeTab === 'logout' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'text-slate-400'}`}>
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"/></svg>
                </button>
                <button onClick={() => setShowProfile(false)} className="mt-auto text-slate-300 font-bold hover:text-slate-500">رجوع</button>
             </div>
             {/* Tab Content */}
             <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'profile' && (
                  <div className="animate-in fade-in duration-300">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">الملف الشخصي</h2>
                    <div className="flex flex-col items-center mb-8">
                       <img src={currentUser.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 mb-4" />
                       <button className="text-blue-600 text-xs font-bold">تغيير صورة الملف</button>
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-bold px-2">الاسم</label>
                          <input className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" defaultValue={currentUser.name} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-bold px-2">البريد الإلكتروني</label>
                          <input className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none" defaultValue={currentUser.email} disabled />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-bold px-2">كلمة المرور</label>
                          <input className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="********" />
                       </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-8 shadow-xl shadow-blue-100 hover:scale-[0.98] transition-transform">حفظ التعديلات</button>
                  </div>
                )}
                {activeTab === 'info' && (
                   <div className="animate-in fade-in duration-300 h-full flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4">
                         <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                      </div>
                      <h3 className="text-xl font-bold">عن تطبيقنا</h3>
                      <p className="text-slate-500 mt-4 leading-relaxed">تطبيق ChatPro هو منصة تواصل حديثة تجمع بين المراسلة السهلة والذكاء الاصطناعي المتطور.</p>
                      <div className="mt-8 pt-8 border-t w-full">
                         <p className="text-xs font-bold text-slate-400">بواسطة المطور المحترف</p>
                      </div>
                   </div>
                )}
                {activeTab === 'logout' && (
                   <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-300">
                      <h3 className="text-xl font-bold">تسجيل الخروج؟</h3>
                      <p className="text-slate-400 mb-8 mt-2">هل أنت متأكد من رغبتك في المغادرة؟</p>
                      <button onClick={onLogout} className="bg-red-500 text-white font-bold px-12 py-4 rounded-2xl shadow-xl shadow-red-100 hover:scale-105 transition-transform">تأكيد الخروج</button>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
