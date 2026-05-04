
import React, { useState, useEffect } from 'react';
import { generatePoem, getSuggestions, CreativeSuggestions } from '../services/geminiService';
import { saveToHistory, getHistory } from '../services/storageService';
import { HistoryItem, PoetryGeneration } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Sparkles, 
  History as HistoryIcon, 
  ArrowLeft, 
  Scale, 
  Trash2, 
  Maximize2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

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

  // Load history from storage on mount
  useEffect(() => {
    const globalHistory = getHistory();
    const generationHistory = globalHistory
      .filter(item => item.type === 'generation')
      .map(item => {
        const data = item.data as PoetryGeneration;
        return {
          id: item.id,
          topic: data.prompt,
          meter: data.meter,
          verses: data.generatedVerses,
          timestamp: new Date(item.timestamp)
        };
      });
    setHistory(generationHistory);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const generatedVerses = await generatePoem(topic, meter, count);
      const newPoemId = Math.random().toString(36).slice(2, 11);
      const newPoem: GeneratedPoem = {
        id: newPoemId,
        topic,
        meter,
        verses: generatedVerses,
        timestamp: new Date()
      };
      
      setHistory(prev => [newPoem, ...prev]);
      
      // Save to global storage
      saveToHistory({
        type: 'generation',
        data: {
          prompt: topic,
          generatedVerses: generatedVerses,
          meter
        }
      });
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

  const sortedSelectedPoems = selectedIds
    .map(id => history.find(p => p.id === id))
    .filter((p): p is GeneratedPoem => !!p);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!isComparingNow ? (
          <motion.div
            key="generator-main"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 reveal">
              <h2 className="text-xl font-bold text-emerald-900 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-500" />
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
                        <Sparkles className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                  
                  {suggestions && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-6 space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                          إلهام إبداعي فوري
                        </h3>
                        <button onClick={() => setSuggestions(null)} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">مسح</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                          <h4 className="text-[9px] font-black text-emerald-800 mb-3 uppercase tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            ثيمات وعوالم
                          </h4>
                          <div className="flex flex-col gap-2">
                            {suggestions.themes.map((s, idx) => (
                              <button
                                key={idx}
                                onClick={() => addSuggestion(s)}
                                className="bg-white text-emerald-700 text-[10px] p-2.5 rounded-xl border border-emerald-50 hover:border-emerald-500 hover:shadow-sm transition-all text-right font-bold"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                          <h4 className="text-[9px] font-black text-rose-800 mb-3 uppercase tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                            صور وأخيلة
                          </h4>
                          <div className="flex flex-col gap-2">
                            {suggestions.imagery.map((s, idx) => (
                              <button
                                key={idx}
                                onClick={() => addSuggestion(s)}
                                className="bg-white text-rose-700 text-[10px] p-2.5 rounded-xl border border-rose-50 hover:border-rose-500 hover:shadow-sm transition-all text-right font-bold"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                          <h4 className="text-[9px] font-black text-amber-800 mb-3 uppercase tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            انفعالات وجدانية
                          </h4>
                          <div className="flex flex-col gap-2">
                            {suggestions.emotions.map((s, idx) => (
                              <button
                                key={idx}
                                onClick={() => addSuggestion(s)}
                                className="bg-white text-amber-700 text-[10px] p-2.5 rounded-xl border border-amber-50 hover:border-amber-500 hover:shadow-sm transition-all text-right font-bold"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="grid grid-cols-2 gap-2">
                      {lengths.map((num) => (
                        <button
                          key={num}
                          onClick={() => setCount(num)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
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
                        <ChevronRight className="group-hover:translate-x-[-4px] transition-transform w-5 h-5" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </section>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4" />
                  سجل المسودات
                </h3>
                {history.length > 1 && (
                  <div className="flex items-center gap-2">
                    {compareMode && selectedIds.length === 2 && (
                      <motion.button 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={startComparison}
                        className="text-[10px] font-black px-4 py-2 rounded-full bg-emerald-600 text-white shadow-lg flex items-center gap-2"
                      >
                        <Scale className="w-3 h-3" />
                        بدء المقارنة الآن
                      </motion.button>
                    )}
                    <button 
                      onClick={() => {
                        setCompareMode(!compareMode);
                        if (!compareMode) setSelectedIds([]);
                      }}
                      className={`text-[10px] font-black px-4 py-1.5 rounded-full border-2 transition-all flex items-center gap-2 ${
                        compareMode 
                        ? 'bg-amber-400 text-amber-950 border-amber-400' 
                        : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <Scale className="w-3 h-3" />
                      {compareMode ? 'إلغاء الوضع' : 'وضع المقارنة'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((poem) => (
                  <motion.div 
                    layout
                    key={poem.id}
                    onClick={() => compareMode && toggleSelection(poem.id)}
                    className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer relative group flex flex-col ${
                      selectedIds.includes(poem.id) 
                      ? 'border-emerald-500 bg-emerald-50/30 scale-[1.02] shadow-xl' 
                      : 'border-emerald-50 hover:border-emerald-200'
                    }`}
                  >
                    {compareMode && (
                      <div className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedIds.includes(poem.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 bg-white'
                      }`}>
                        {selectedIds.includes(poem.id) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="w-2 h-2 bg-gray-100 rounded-full"></span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase">بحر {poem.meter}</span>
                        <h4 className="text-sm font-bold text-emerald-950 truncate max-w-[150px]">{poem.topic}</h4>
                      </div>
                      <span className="text-[8px] text-gray-300 font-bold">{poem.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="space-y-2 mb-6 flex-grow">
                      {poem.verses.slice(0, 2).map((v, i) => (
                        <p key={i} className="poetry-font text-base text-gray-700 text-center italic">{v}</p>
                      ))}
                      {poem.verses.length > 2 && <p className="text-[8px] text-center text-gray-300">...</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removePoem(poem.id); }} 
                        className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {!compareMode && (
                        <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {history.length === 0 && (
                <div className="text-center py-20 opacity-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🏜️</div>
                  <p className="text-xs font-black uppercase tracking-widest">السجل بانتظار أبياتك الأولى</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="comparison-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 pb-20"
          >
            <div className="flex items-center justify-between px-2 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white">
              <button 
                onClick={() => setIsComparingNow(false)}
                className="flex items-center gap-2 text-[10px] font-black bg-emerald-100 text-emerald-800 px-5 py-2.5 rounded-full border border-emerald-200 hover:bg-emerald-200 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة لاختيار المسودات
              </button>
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">تحليل مقارن للقصائد</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sortedSelectedPoems.map((poem, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  key={poem.id} 
                  className="bg-white p-10 rounded-[3.5rem] border border-emerald-50 text-center space-y-8 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-center">
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-4 py-1.5 rounded-full shadow-lg border border-emerald-500 uppercase tracking-widest">
                        الخيار {index === 0 ? 'الأول' : 'الثاني'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">بحر {poem.meter}</p>
                      <h4 className="text-xl font-black text-emerald-950 px-4 py-2 bg-emerald-50 rounded-2xl inline-block">{poem.topic}</h4>
                    </div>

                    <div className="space-y-8 relative">
                      {/* Decorative Line */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-emerald-100 opacity-30"></div>
                      
                      {poem.verses.map((v, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[8px] font-black text-emerald-300 px-2 rounded-full border border-emerald-50">{i + 1}</span>
                          <p className="poetry-font text-gray-900 text-2xl leading-relaxed italic hover:text-emerald-700 transition-colors cursor-default">
                            {v}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-gray-50 flex justify-center gap-6">
                       <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-emerald-800">{poem.verses.length}</span>
                          <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest">عدد الأبيات</span>
                       </div>
                       <div className="w-px h-8 bg-gray-100"></div>
                       <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-emerald-800">{poem.meter}</span>
                          <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest">الوزن العروضي</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeneratorView;
