
import React, { useState, useEffect, useMemo } from 'react';
import { generateQuizQuestion, getSmartFeedback } from '../services/geminiService';
import { QuizQuestion, AssessmentFeedback, AdvancedStats, SessionStat } from '../types';

interface AssessmentViewProps {
  onClose: () => void;
  level: string;
}

const STATS_KEY = 'arudi_assessment_stats';

const AssessmentView: React.FC<AssessmentViewProps> = ({ onClose, level }) => {
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AssessmentFeedback | null>(null);
  const [testType, setTestType] = useState<'knowledge' | 'skill'>('knowledge');
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showSummary, setShowSummary] = useState(false);

  // Stats for the CURRENT session
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    totalTime: 0,
    missedTypes: { knowledge: 0, skill: 0 } as Record<string, number>
  });

  // Persisted Global Stats
  const [globalStats, setGlobalStats] = useState<AdvancedStats>(() => {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) return JSON.parse(saved);
    return {
      totalCorrect: 0,
      totalQuestions: 0,
      totalTime: 0,
      missedTypes: { knowledge: 0, skill: 0 },
      sessionHistory: []
    };
  });

  const loadQuestion = async (type: 'knowledge' | 'skill') => {
    setLoading(true);
    setFeedback(null);
    setSelectedOption(null);
    setShowHint(false);
    try {
      const q = await generateQuizQuestion(type, level);
      setQuestion(q);
      setStartTime(Date.now());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion(testType);
  }, [testType]);

  const saveSessionToGlobal = () => {
    if (sessionStats.total === 0) return;

    const newSession: SessionStat = {
      timestamp: Date.now(),
      correct: sessionStats.correct,
      total: sessionStats.total,
      avgTime: sessionStats.totalTime / sessionStats.total / 1000
    };

    const updatedGlobal: AdvancedStats = {
      totalCorrect: globalStats.totalCorrect + sessionStats.correct,
      totalQuestions: globalStats.totalQuestions + sessionStats.total,
      totalTime: globalStats.totalTime + sessionStats.totalTime,
      missedTypes: {
        knowledge: globalStats.missedTypes.knowledge + sessionStats.missedTypes.knowledge,
        skill: globalStats.missedTypes.skill + sessionStats.missedTypes.skill,
      },
      sessionHistory: [...globalStats.sessionHistory, newSession].slice(-10) // Keep last 10
    };

    setGlobalStats(updatedGlobal);
    localStorage.setItem(STATS_KEY, JSON.stringify(updatedGlobal));
  };

  const handleSubmit = async () => {
    if (!question || !selectedOption) return;
    setEvaluating(true);
    const endTime = Date.now();
    const duration = endTime - startTime;

    try {
      const result = await getSmartFeedback(question.question, selectedOption, question.correctAnswer);
      setFeedback(result);
      
      setSessionStats(prev => ({
        total: prev.total + 1,
        correct: result.isCorrect ? prev.correct + 1 : prev.correct,
        totalTime: prev.totalTime + duration,
        missedTypes: !result.isCorrect 
          ? { ...prev.missedTypes, [question.type]: prev.missedTypes[question.type] + 1 }
          : prev.missedTypes
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setEvaluating(false);
    }
  };

  const avgSessionTime = useMemo(() => {
    if (sessionStats.total === 0) return 0;
    return (sessionStats.totalTime / sessionStats.total / 1000).toFixed(1);
  }, [sessionStats]);

  const accuracy = useMemo(() => {
    if (sessionStats.total === 0) return 0;
    return Math.round((sessionStats.correct / sessionStats.total) * 100);
  }, [sessionStats]);

  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-emerald-950 z-[70] flex flex-col p-6 animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-y-auto text-white">
        <div className="max-w-xl mx-auto w-full space-y-8 py-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black">ملخص الأداء العروضي</h2>
            <p className="text-emerald-400/60 font-bold uppercase tracking-widest text-[10px]">تقرير الجلسة التدريبية</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-center">
              <span className="block text-[10px] font-black text-emerald-500 uppercase mb-1">الدقة الكلية</span>
              <span className="text-3xl font-black">{accuracy}%</span>
            </div>
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-center">
              <span className="block text-[10px] font-black text-amber-400 uppercase mb-1">متوسط الوقت</span>
              <span className="text-3xl font-black">{avgSessionTime}ث</span>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest">تحليل نقاط الضعف</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">المعارف العروضية</span>
                <span className="text-xs text-red-400">-{sessionStats.missedTypes.knowledge} أخطاء</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500" 
                  style={{ width: `${(sessionStats.missedTypes.knowledge / (sessionStats.total || 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">المهارات التطبيقية</span>
                <span className="text-xs text-red-400">-{sessionStats.missedTypes.skill} أخطاء</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500" 
                  style={{ width: `${(sessionStats.missedTypes.skill / (sessionStats.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {globalStats.sessionHistory.length > 1 && (
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
              <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-6">اتجاه الأداء (آخر 10 جلسات)</h3>
              <div className="flex items-end justify-between h-24 gap-1">
                {globalStats.sessionHistory.map((s, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-emerald-500/20 rounded-t-lg relative group transition-all hover:bg-emerald-500/40"
                    style={{ height: `${(s.correct / s.total) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-0 group-hover:opacity-100">
                      {Math.round((s.correct / s.total) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                saveSessionToGlobal();
                onClose();
              }}
              className="w-full py-6 bg-emerald-500 text-emerald-950 font-black rounded-[2rem] shadow-xl shadow-emerald-500/20 hover:scale-95 transition-all"
            >
              العودة للأكاديمية
            </button>
            <button 
              onClick={() => {
                saveSessionToGlobal();
                setSessionStats({ correct: 0, total: 0, totalTime: 0, missedTypes: { knowledge: 0, skill: 0 } });
                setShowSummary(false);
                loadQuestion(testType);
              }}
              className="w-full py-4 text-emerald-100/50 font-black text-xs uppercase"
            >
              بدء جلسة تدريبية جديدة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-emerald-950/98 backdrop-blur-2xl z-[60] flex flex-col p-6 animate-in fade-in duration-500 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <button 
          onClick={() => {
            if (sessionStats.total > 0) setShowSummary(true);
            else onClose();
          }}
          className="w-12 h-12 flex items-center justify-center bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all border border-white/10 shadow-inner"
        >
          <span className="text-xl">✕</span>
        </button>
        <div className="text-center">
          <h2 className="text-white font-black text-xl tracking-tight">محرك التقويم الذكي</h2>
          <div className="flex gap-2 mt-2 justify-center">
             <button 
               onClick={() => setTestType('knowledge')}
               className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase transition-all border ${testType === 'knowledge' ? 'bg-amber-400 text-emerald-950 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105' : 'bg-transparent text-emerald-100/40 border-emerald-800'}`}
             >
               المعارف
             </button>
             <button 
               onClick={() => setTestType('skill')}
               className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase transition-all border ${testType === 'skill' ? 'bg-amber-400 text-emerald-950 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105' : 'bg-transparent text-emerald-100/40 border-emerald-800'}`}
             >
               المهارات
             </button>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-amber-400 font-black text-lg">
            {sessionStats.correct}<span className="text-emerald-500/50 text-xs mx-1">/</span>{sessionStats.total}
          </div>
          <span className="text-[9px] text-emerald-500/40 font-black">{avgSessionTime}ث معدل</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center max-w-xl mx-auto w-full">
        {loading ? (
          <div className="text-center space-y-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-t-4 border-amber-400 rounded-full animate-spin"></div>
              <div className="absolute inset-4 bg-emerald-900/20 rounded-full flex items-center justify-center text-3xl">📜</div>
            </div>
            <p className="text-emerald-50 text-lg font-bold animate-pulse">جاري استدعاء تحدّي مستوى {level}...</p>
          </div>
        ) : question ? (
          <div className="bg-white rounded-[3.5rem] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] space-y-8 relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full uppercase border border-emerald-200">
                  {question.type === 'knowledge' ? 'إطار نظري' : 'تطبيق وزني'}
                </span>
                {!feedback && (
                   <button 
                    onClick={() => setShowHint(true)}
                    className="text-amber-500 text-xs font-bold flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full"
                   >
                     <span>💡</span> تلميحة
                   </button>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-emerald-950 leading-relaxed poetry-font">
                {question.question}
              </h3>
              
              {showHint && !feedback && (
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl text-amber-800 text-xs italic">
                   <span className="font-bold ml-1">تلميحة:</span> {question.hint}
                </div>
              )}
            </div>

            <div className="space-y-3 relative z-10">
              {question.options?.map((opt, i) => (
                <button
                  key={i}
                  disabled={!!feedback || evaluating}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full p-5 rounded-[1.5rem] text-right text-sm font-bold transition-all border-2 ${
                    selectedOption === opt 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-lg scale-[1.02]' 
                      : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:border-emerald-200'
                  } ${feedback && opt === question.correctAnswer ? 'border-green-500 bg-green-50 text-green-800' : ''} ${
                    feedback && selectedOption === opt && !feedback.isCorrect ? 'border-red-500 bg-red-50 text-red-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black ${
                      selectedOption === opt ? 'bg-emerald-600 text-white' : 'bg-gray-200/50 text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-grow">{opt}</span>
                    {feedback && opt === question.correctAnswer && <span>✅</span>}
                  </div>
                </button>
              ))}
            </div>

            {feedback ? (
              <div className={`p-6 rounded-[2rem] border-2 space-y-4 ${feedback.isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-emerald-950">{feedback.message}</h4>
                  <span className="text-xs font-black bg-white/50 px-3 py-1 rounded-full">{feedback.score}/10</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{feedback.guidance}</p>
                
                <button 
                  onClick={() => loadQuestion(testType)}
                  className="w-full py-4 bg-emerald-950 text-white rounded-[1.5rem] text-sm font-black hover:bg-emerald-900 transition-all"
                >
                  التحدي التالي ◀
                </button>
              </div>
            ) : (
              <button
                disabled={!selectedOption || evaluating}
                onClick={handleSubmit}
                className={`w-full py-5 rounded-[2rem] font-black text-base transition-all shadow-2xl ${
                  !selectedOption || evaluating ? 'bg-gray-100 text-gray-400' : 'bg-emerald-800 text-white hover:bg-emerald-900'
                }`}
              >
                {evaluating ? 'جاري التحليل...' : 'تأكيد الإجابة'}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-8 text-center shrink-0">
        <button 
          onClick={() => {
            saveSessionToGlobal();
            setShowSummary(true);
          }}
          className="text-[10px] font-black text-emerald-100/30 uppercase tracking-widest hover:text-emerald-100 transition-colors"
        >
          إنهاء الجلسة وعرض التقرير النهائي
        </button>
      </div>
    </div>
  );
};

export default AssessmentView;
