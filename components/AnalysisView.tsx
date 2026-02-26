
import React, { useState, useMemo, useEffect } from 'react';
import { analyzeVerse } from '../services/geminiService';
import { ProsodyAnalysis } from '../types';

const AnalysisView: React.FC = () => {
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProsodyAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!verse.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeVerse(verse);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تحليل البيت. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // Re-run animation observer when result changes
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [result]);

  const RhythmicChart = ({ scanning }: { scanning: string }) => {
    const blocks = useMemo(() => {
      const cleaned = scanning.replace(/\s/g, '');
      return Array.from(cleaned).map((char, i) => ({
        type: (char === '1' || char === '—' || char === '-') ? 'long' : 'short',
        original: char,
        id: i
      }));
    }, [scanning]);

    const totalWidth = blocks.length * 35;
    const height = 100;

    return (
      <div className="w-full bg-emerald-950/5 p-8 rounded-[2.5rem] border border-emerald-100/50 overflow-x-auto reveal shadow-inner">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">نبض البحر العروضي</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[9px] text-gray-500 font-bold">مقطع ممدود</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-[9px] text-gray-500 font-bold">مقطع قصير</span>
            </div>
          </div>
        </div>
        
        <div className="relative min-w-full">
          <svg 
            width={totalWidth} 
            height={height} 
            viewBox={`0 0 ${totalWidth} ${height}`}
            className="mx-auto overflow-visible"
          >
            <path
              d={`M 15,${height/2} ${blocks.map((_, i) => `L ${15 + i*35},${height/2}`).join(' ')}`}
              stroke="currentColor"
              className="text-emerald-100"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
            />
            
            {blocks.map((block, i) => {
              const x = 15 + i * 35;
              const barHeight = block.type === 'long' ? 40 : 20;
              return (
                <g key={block.id} className="cursor-help group">
                  <rect
                    x={x - 10}
                    y={height/2 - barHeight/2}
                    width="20"
                    height={barHeight}
                    rx="10"
                    className={`transition-all duration-700 ${block.type === 'long' ? 'fill-emerald-600' : 'fill-amber-400 opacity-60'}`}
                  >
                    <animate attributeName="height" from="0" to={barHeight} dur="1.2s" fill="freeze" />
                  </rect>
                  <text
                    x={x}
                    y={height - 5}
                    textAnchor="middle"
                    className="text-[10px] font-black fill-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {block.original}
                  </text>
                  <circle
                    cx={x}
                    cy={height/2}
                    r="3"
                    className="fill-white shadow-sm"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border border-emerald-50 reveal">
        <h2 className="text-xl font-bold text-emerald-900 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl shadow-inner border border-emerald-50">⚖️</div>
             <div>
                <span className="block font-black">محلل الأوزان الذكي</span>
                <span className="block text-[10px] text-emerald-600/50 font-black uppercase tracking-tight">نظام تشريح الأبيات عروضياً</span>
             </div>
          </div>
        </h2>
        
        <div className="relative group">
          <textarea
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            placeholder="أدخل البيت الشعري المراد تشريحه..."
            className="w-full p-8 border-2 border-gray-100 rounded-[2.5rem] focus:ring-12 focus:ring-emerald-500/5 focus:border-emerald-500 poetry-font text-2xl md:text-3xl resize-none min-h-[140px] bg-gray-50/20 transition-all outline-none leading-loose text-center placeholder:opacity-20 shadow-inner"
            dir="rtl"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !verse.trim()}
          className={`w-full mt-6 py-6 rounded-[2rem] font-black text-lg transition-all shadow-2xl relative overflow-hidden group ${
            loading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95 shadow-emerald-900/20'
          }`}
        >
          <div className="relative z-10 flex items-center justify-center gap-4">
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-emerald-200 border-t-white rounded-full animate-spin"></div>
                <span className="tracking-wide">جاري تفكيك التفعيلات...</span>
              </>
            ) : (
              <>
                <span>تحليل البيت عروضياً</span>
                <span className="text-2xl group-hover:translate-x-[-8px] transition-transform">◀</span>
              </>
            )}
          </div>
        </button>
      </section>

      {result && (
        <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl border border-emerald-50 space-y-10 reveal">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 border-b border-gray-50 pb-10">
            <div className="text-center md:text-right space-y-5 reveal">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className={`px-6 py-2 rounded-full text-[11px] font-black border-2 uppercase tracking-widest shadow-sm ${result.isCorrect ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-100'}`}>
                   بحر {result.meter}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner ${result.isCorrect ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'} animate-pulse`}>
                  {result.isCorrect ? '✨' : '⚠️'}
                </div>
              </div>
              <h3 className="poetry-font text-3xl md:text-5xl leading-relaxed text-emerald-950 font-black italic">
                {result.diacritizedVerse}
              </h3>
            </div>
            <div className="bg-emerald-950 text-white p-6 rounded-[2rem] flex flex-col items-center justify-center min-w-[120px] shadow-2xl border-t-4 border-emerald-500 reveal">
               <span className="text-[10px] font-black text-emerald-400 uppercase mb-1 tracking-tighter">التوافق العروضي</span>
               <span className="text-3xl font-black">{result.isCorrect ? '100%' : '75%'}</span>
            </div>
          </div>

          <RhythmicChart scanning={result.scanning} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
            <div className="bg-gray-50/80 p-8 rounded-[2.5rem] border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all">
              <p className="text-[10px] font-black text-emerald-700 mb-6 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                التفاعيل المستخرجة
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {result.feet.map((foot, idx) => (
                  <div key={idx} className="bg-white px-6 py-4 rounded-2xl text-xl font-bold text-emerald-900 border border-emerald-50 shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-all poetry-font cursor-default">
                    {foot}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-900 text-emerald-50 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex items-center reveal">
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-20"></div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                  قراءة المحرك
                </h4>
                <p className="text-base md:text-lg leading-relaxed font-medium opacity-95 italic poetry-font">
                  "{result.explanation}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
