
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', avatar: 'https://i.pravatar.cc/150?u=user' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const globalUsers = JSON.parse(localStorage.getItem('global_users') || '[]');

    if (mode === 'signup') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        avatar: formData.avatar,
        status: 'نشط الآن'
      };
      globalUsers.push(newUser);
      localStorage.setItem('global_users', JSON.stringify(globalUsers));
      setMode('login'); // Pre-fill flow
    } else {
      const user = globalUsers.find((u: any) => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        alert("خطأ في البيانات أو المستخدم غير موجود");
      }
    }
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100 scale-95 md:scale-100">
      <div className="flex flex-col items-center mb-8">
        <div className="relative cursor-pointer group" onClick={() => mode === 'signup' && fileInputRef.current?.click()}>
          <img src={formData.avatar} className="w-28 h-28 rounded-full border-4 border-blue-600 p-1 object-cover shadow-xl transition-transform group-hover:scale-105" alt="Avatar" />
          {mode === 'signup' && (
            <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full border-2 border-white shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mt-4">{mode === 'signup' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h1>
        <p className="text-slate-400 text-sm mt-1">{mode === 'signup' ? 'ابدأ رحلتك معنا الآن' : 'أهلاً بك مجدداً في ChatPro'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <input 
            type="text" placeholder="اسمك الكامل" required
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
          />
        )}
        <input 
          type="email" placeholder="البريد الإلكتروني" required
          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
        />
        <input 
          type="password" placeholder="كلمة المرور" required
          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
        />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95">
          {mode === 'signup' ? 'إنشاء الحساب' : 'دخول'}
        </button>
      </form>
      <div className="mt-8 text-center">
        <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="text-blue-600 font-semibold text-sm hover:text-blue-800 underline underline-offset-4">
          {mode === 'signup' ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ اشترك مجاناً'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
