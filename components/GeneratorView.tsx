
import React, { useState } from 'react';
import { generatePoem, getSuggestions, CreativeSuggestions } from '../services/geminiService';

interface GeneratedPoem {
  id: string;
  topic: string;
  meter: string;
  verses: string[];
  timestamp: Date;
}

const GeneratorView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [meter, setMeter] = useState('الطويل');
  const [count, setCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<CreativeSuggestions | null>(null);
  const [history, setHistory] = useState<GeneratedPoem[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparingNow, setIsComparingNow] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const generatedVerses = await generatePoem(topic, meter, count);
      const newPoem: GeneratedPoem = {
        id: Math.random().toString(36).substr(2, 9),
        topic,
        meter,
        verses: generatedVerses,
        timestamp: new Date()
      };
      setHistory(prev => [newPoem, ...prev]);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء توليد الشعر.');
    } finally {
      setLoading(false);
    }
  };

  const handleBoost = async () => {
    if (!topic.trim()) return;
    setSuggesting(true);
    try {
      const ideas = await getSuggestions(topic);
      setSuggestions(ideas);
    } catch (error) {
      console.error(error);
    } finally {
      setSuggesting(false);
    }
  };

  const addSuggestion = (s: string) => {
    const current = topic.trim();
    if (current && !current.endsWith('،') && !current.endsWith(',')) {
      setTopic(`${current}، ${s}`);
    } else {
      setTopic(`${current} ${s}`);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return [prev[1], id]; // Slide window
    });
  };

  const removePoem = (id: string) => {
    setHistory(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const startComparison = () => {
    if (selectedIds.length === 2) {
      setIsComparingNow(true);
    }
  };

  const meters = [
    'الطويل', 'المديد', 'البسيط', 'الوافر', 'الكامل', 'الهزج', 
    'الرجز', 'الرمل', 'السريع', 'المنسرح', 'الخفيف', 'المضارع', 
    'المقتضب', 'المجتث', 'المتقارب', 'المتدارك'
  ];
  const lengths = [2, 4, 6, 8];

  const compareList = history.filter(p => selectedIds.includes(p.id));

  return (
    <div className="space-y-6">
      {!isComparingNow && (
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 reveal">
          <h2 className="text-xl font-bold text-emerald-900 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✍️</span>
              <span>نظّام القوافي الذكي</span>
            </div>
          </h2>
          
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">عما ستتحدث قصيدتك اليوم؟</label>
              <div className="relative group">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: غروب الشمس، حب الوطن..."
                  className="w-full p-5 pl-16 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-lg placeholder:text-gray-300 shadow-sm"
                />
                <button
                  onClick={handleBoost}
                  disabled={suggesting || !topic.trim()}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
                    suggesting 
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                    : 'bg-amber-50 text-amber-500 hover:bg-amber-100 active:scale-90 hover:shadow-md'
                  }`}
                  title="تعزيز الإلهام ✨"
                >
                  {suggesting ? (
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-xl">✨</span>
                  )}
                </button>
              </div>
              
              {suggestions && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                      إلهام إبداعي فوري
                    </h3>
                    <button onClick={() => setSuggestions(null)} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">مسح</button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {suggestions.imagery.map((s, idx) => (
                      <button
                        key={`img-${idx}`}
                        onClick={() => addSuggestion(s)}
                        className="bg-sky-50 text-sky-700 text-xs px-3.5 py-2 rounded-full border border-sky-100 hover:bg-sky-100 hover:scale-105 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <span className="text-sky-400">🖼️</span> {s}
                      </button>
                    ))}
                    {suggestions.emotions.map((s, idx) => (
                      <button
                        key={`emo-${idx}`}
                        onClick={() => addSuggestion(s)}
                        className="bg-rose-50 text-rose-700 text-xs px-3.5 py-2 rounded-full border border-rose-100 hover:bg-rose-100 hover:scale-105 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <span className="text-rose-400">❤️</span> {s}
                      </button>
                    ))}
                    {suggestions.themes.map((s, idx) => (
                      <button
                        key={`theme-${idx}`}
                        onClick={() => addSuggestion(s)}
                        className="bg-emerald-50 text-emerald-700 text-xs px-3.5 py-2 rounded-full border border-emerald-100 hover:bg-emerald-100 hover:scale-105 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <span className="text-emerald-400">📜</span> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-3 mr-1">البحر الشعري:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 h-40 overflow-y-auto p-2 border border-gray-50 rounded-2xl bg-gray-50/30">
                {meters.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMeter(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      meter === m 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-3 mr-1">طول القصيدة:</label>
              <div className="flex gap-2">
                {lengths.map((num) => (
                  <button
                    key={num}
                    onClick={() => setCount(num)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      count === num
                        ? 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm'
                        : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {num} {num === 2 ? 'بيتان' : 'أبيات'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className={`w-full py-5 rounded-2xl font-black transition-all shadow-xl group overflow-hidden relative ${
                loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95 shadow-emerald-900/10'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جاري صياغة القوافي...</span>
                  </>
                ) : (
                  <>
                    <span>نظم القصيدة الآن</span>
                    <span className="group-hover:translate-x-[-4px] transition-transform text-xl">◀</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </section>
      )}

      {isComparingNow ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={() => setIsComparingNow(false)}
              className="text-xs font-black bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full border border-emerald-200"
            >
              ◀ العودة للاختيار
            </button>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">مقارنة القصائد المختارة</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {compareList.map((poem) => (
              <div 
                key={poem.id} 
                className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 text-center space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-6 right-8">
                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">بحر {poem.meter}</span>
                </div>
                <div className="space-y-6 relative z-10 pt-4">
                  <div className="border-b border-gray-50 pb-4 mb-4">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">الموضوع:</p>
                    <p className="text-xs text-emerald-800 font-black truncate">{poem.topic}</p>
                  </div>
                  <div className="space-y-6">
                    {poem.verses.map((v, i) => (
                      <p key={i} className="poetry-font text-gray-900 text-xl leading-relaxed">
                        {v}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 reveal">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">سجل المسودات</h3>
            {history.length > 1 && (
              <div className="flex items-center gap-2">
                {compareMode && selectedIds.length === 2 && (
                  <button 
                    onClick={startComparison}
                    className="text-[10px] font-black px-4 py-2 rounded-full bg-emerald-600 text-white shadow-lg animate-pulse"
                  >
                    بدء المقارنة الآن 🎭
                  </button>
                )}
                <button 
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (!compareMode) setSelectedIds([]);
                  }}
                  className={`text-[10px] font-black px-4 py-1.5 rounded-full border-2 transition-all ${
                    compareMode 
                    ? 'bg-amber-400 text-amber-950 border-amber-400' 
                    : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {compareMode ? 'إلغاء الوضع' : 'وضع المقارنة ⚖️'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {history.map((poem, idx) => (
              <div 
                key={poem.id}
                onClick={() => compareMode && toggleSelection(poem.id)}
                className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer relative group ${
                  selectedIds.includes(poem.id) 
                  ? 'border-emerald-500 bg-emerald-50/30 scale-[1.01] shadow-xl' 
                  : 'border-emerald-50 hover:border-emerald-200'
                } ${compareMode ? 'active:scale-95' : ''}`}
              >
                {compareMode && (
                  <div className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedIds.includes(poem.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 bg-white'
                  }`}>
                    {selectedIds.includes(poem.id) && <span className="text-[10px] font-black">{selectedIds.indexOf(poem.id) + 1}</span>}
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-emerald-600 uppercase">بحر {poem.meter}</p>
                    <h4 className="text-sm font-bold text-emerald-950 truncate max-w-[200px]">{poem.topic}</h4>
                  </div>
                  <span className="text-[8px] text-gray-300 font-bold">{poem.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {!compareMode && (
                  <div className="space-y-3 mb-6">
                    {poem.verses.slice(0, 2).map((v, i) => (
                      <p key={i} className="poetry-font text-lg text-gray-700 text-center">{v}</p>
                    ))}
                    {poem.verses.length > 2 && <p className="text-[8px] text-center text-gray-300">...</p>}
                  </div>
                )}

                <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); removePoem(poem.id); }} className="text-[10px] text-rose-400 font-bold hover:text-rose-600">حذف</button>
                   {!compareMode && <button className="text-[10px] text-emerald-700 font-bold">عرض كامل</button>}
                </div>
              </div>
            ))}
          </div>

          {history.length === 0 && (
            <div className="text-center py-10 opacity-20">
              <span className="text-5xl block mb-2">🏜️</span>
              <p className="text-xs font-black">لا توجد قصائد في السجل بعد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneratorView;
