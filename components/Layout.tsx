
import React, { useEffect, useRef, useState } from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [scrollPos, setScrollPos] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        setScrollPos(mainRef.current.scrollTop);
      }
    };
    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const tabs = [
    { id: AppTab.ANALYSIS, label: 'محلل الأوزان', icon: '⚖️' },
    { id: AppTab.LEARNING, label: 'أكاديمية العروض', icon: '🎓' },
    { id: AppTab.GENERATOR, label: 'مولد الشعر', icon: '✍️' },
    { id: AppTab.HISTORY, label: 'سجلي', icon: '📚' }
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white/40 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      {/* Decorative Floating Elements (Parallax) */}
      <div 
        className="absolute top-20 left-10 text-4xl opacity-5 pointer-events-none select-none transition-transform duration-75"
        style={{ transform: `translateY(${scrollPos * 0.2}px) rotate(${scrollPos * 0.1}deg)` }}
      >
        ق
      </div>
      <div 
        className="absolute top-80 right-20 text-6xl opacity-5 pointer-events-none select-none transition-transform duration-75"
        style={{ transform: `translateY(${scrollPos * -0.15}px) rotate(${scrollPos * -0.05}deg)` }}
      >
        ف
      </div>
      <div 
        className="absolute bottom-40 left-20 text-5xl opacity-5 pointer-events-none select-none transition-transform duration-75"
        style={{ transform: `translateY(${scrollPos * 0.1}px)` }}
      >
        ل
      </div>

      {/* Header with Subtle Parallax on Content */}
      <header 
        className="bg-emerald-800 text-white p-6 rounded-b-[2.5rem] shadow-xl sticky top-0 z-50 overflow-hidden transition-all duration-300"
        style={{ height: Math.max(120, 160 - scrollPos * 0.2) + 'px' }}
      >
        {/* Animated Header Background */}
        <div className="absolute inset-0 opacity-10">
           <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-[pulse-soft_10s_infinite]"></div>
        </div>

        <div className="flex justify-between items-center relative z-10 h-full">
          <div 
            className="flex flex-col transition-transform duration-300 origin-right"
            style={{ transform: `scale(${Math.max(0.8, 1 - scrollPos * 0.001)})` }}
          >
            <h1 className="text-2xl font-bold font-serif leading-tight tracking-wide drop-shadow-md">عروضـي</h1>
            <p className="text-emerald-100 text-[11px] opacity-80 font-medium">مختبر الشعر العربي الذكي</p>
            <p className="text-amber-300 text-[9px] font-black mt-1.5 bg-emerald-900/40 px-2 py-0.5 rounded-full inline-block w-fit border border-amber-300/10 shadow-sm">
              تصميم وبرمجة: د. أحمد حمدي عاشور الغول
            </p>
          </div>
          <div 
            className="w-14 h-14 bg-emerald-700 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-emerald-600 rotate-3 hover:rotate-0 transition-all duration-500"
            style={{ transform: `translateY(${scrollPos * 0.05}px) rotate(${3 + scrollPos * 0.02}deg)` }}
          >
            🖋️
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main 
        ref={mainRef}
        className="flex-grow p-4 pb-28 overflow-y-auto scroll-smooth perspective-1000"
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 py-3 flex justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 rounded-t-[3rem]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center transition-all duration-500 relative py-2 px-4 rounded-3xl ${
              activeTab === tab.id 
                ? 'text-emerald-700 scale-110 bg-emerald-50 shadow-inner' 
                : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-50/50'
            }`}
          >
            <span className={`text-2xl mb-1 transition-transform duration-300 ${activeTab === tab.id ? 'translate-y-[-2px]' : ''}`}>
                {tab.icon}
            </span>
            <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute top-0 w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
