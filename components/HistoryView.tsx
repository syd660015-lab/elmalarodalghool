
import React, { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../services/storageService';
import { HistoryItem, ProsodyAnalysis, PoetryGeneration } from '../types';

const HistoryView: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'analysis' | 'generation'>('all');

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleClear = () => {
    if (confirm('هل أنت متأكد من مسح السجل بالكامل؟')) {
      clearHistory();
      setItems([]);
    }
  };

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

  const AnalysisCard = ({ data, timestamp }: { data: ProsodyAnalysis, timestamp: number }) => (
    <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">تحليل عروضي</span>
        <span className="text-[10px] text-gray-300 font-bold">{new Date(timestamp).toLocaleString('ar-EG')}</span>
      </div>
      <p className="poetry-font text-lg text-emerald-950 text-center mb-4 truncate italic">"{data.verse}"</p>
      <div className="flex items-center gap-2 justify-center">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">بحر {data.meter}</span>
        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${data.isCorrect ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {data.isCorrect ? 'موزون ✨' : 'مكسور ⚠️'}
        </span>
      </div>
    </div>
  );

  const GenerationCard = ({ data, timestamp }: { data: PoetryGeneration, timestamp: number }) => (
    <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-widest">توليد تلقائي</span>
        <span className="text-[10px] text-gray-300 font-bold">{new Date(timestamp).toLocaleString('ar-EG')}</span>
      </div>
      <p className="text-sm font-black text-gray-500 mb-3 truncate">الموضوع: {data.prompt}</p>
      <div className="space-y-2 mb-4">
        {data.generatedVerses.slice(0, 1).map((v, i) => (
          <p key={i} className="poetry-font text-base text-gray-800 text-center italic">{v}</p>
        ))}
        {data.generatedVerses.length > 1 && <p className="text-center text-[10px] text-gray-300">...</p>}
      </div>
      <div className="flex justify-center">
         <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">بحر {data.meter}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-50 shadow-xl reveal">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📚</div>
           <div>
              <h2 className="text-xl font-black text-emerald-950 leading-tight">سجل النشاط</h2>
              <p className="text-[10px] text-emerald-600/50 font-bold uppercase tracking-widest">تتبع رحلتك مع القوافي</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex bg-gray-100 rounded-2xl p-1">
              {(['all', 'analysis', 'generation'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                    filter === t ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'all' ? 'الكل' : t === 'analysis' ? 'تحليل' : 'نظم'}
                </button>
              ))}
           </div>
           {items.length > 0 && (
             <button onClick={handleClear} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all" title="مسح المار">
                🗑️
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="reveal">
            {item.type === 'analysis' 
              ? <AnalysisCard data={item.data as ProsodyAnalysis} timestamp={item.timestamp} /> 
              : <GenerationCard data={item.data as PoetryGeneration} timestamp={item.timestamp} />
            }
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300 opacity-30 reveal">
          <span className="text-6xl mb-4">🏜️</span>
          <p className="font-black text-sm uppercase tracking-widest">لا توجد سجلات حالياً</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
