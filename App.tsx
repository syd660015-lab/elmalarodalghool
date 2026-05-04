
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import Layout from './components/Layout';
import AnalysisView from './components/AnalysisView';
import LearningView from './components/LearningView';
import GeneratorView from './components/GeneratorView';
import AssessmentView from './components/AssessmentView';
import HistoryView from './components/HistoryView';

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

    const checkReveal = () => {
        const elements = document.querySelectorAll('.reveal');
        elements.forEach(el => observer.observe(el));
    };

    checkReveal();
    
    // Polling slightly to ensure dynamically rendered components are observed
    const interval = setInterval(checkReveal, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
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
      case AppTab.ASSESSMENT:
        return (
          <div className="reveal">
            <AssessmentView 
              onClose={() => setActiveTab(AppTab.LEARNING)} 
              level="متوسط" 
            />
          </div>
        );
      case AppTab.GENERATOR:
        return (
          <div className="reveal"><GeneratorView /></div>
        );
      case AppTab.HISTORY:
        return (
          <div className="reveal"><HistoryView /></div>
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
