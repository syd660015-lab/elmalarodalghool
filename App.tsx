
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import Layout from './components/Layout';
import AnalysisView from './components/AnalysisView';
import LearningView from './components/LearningView';
import GeneratorView from './components/GeneratorView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ANALYSIS);

  // Hook to handle scroll-reveal animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Initial scan and observation
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    // Cleanup and re-scan on tab change
    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.ANALYSIS:
        return (
          <div className="reveal space-y-6">
            <AnalysisView />
          </div>
        );
      case AppTab.LEARNING:
        return (
          <div className="space-y-10">
             <div className="reveal"><LearningView /></div>
          </div>
        );
      case AppTab.GENERATOR:
        return (
          <div className="reveal"><GeneratorView /></div>
        );
      case AppTab.HISTORY:
        return (
          <div className="reveal flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner animate-bounce-subtle">
                📚
            </div>
            <p className="font-bold text-gray-500">سجل التحليلات فارغ</p>
            <p className="text-xs mt-2 italic opacity-60">ابدأ بتشريح الأبيات عروضياً لتظهر هنا.</p>
          </div>
        );
      default:
        return <AnalysisView />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in zoom-in-95 duration-700">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
