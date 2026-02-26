
import React, { useState } from 'react';
import { Lesson } from '../types';
import AssessmentView from './AssessmentView';

const LearningView: React.FC = () => {
  const [showAssessment, setShowAssessment] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const arabicMeters = [
    "الطويل", "المديد", "البسيط", "الوافر", "الكامل", "الهزج", 
    "الرجز", "الرمل", "السريع", "المنسرح", "الخفيف", "المضارع", 
    "المقتضب", "المجتث", "المتقارب", "المتدارك"
  ];

  const lessons: Lesson[] = [
    { id: '1', title: 'أساسيات الكتابة العروضية', description: 'ما ينطق يكتب وما لا ينطق لا يكتب.', difficulty: 'beginner', icon: '📝' },
    { id: '2', title: 'مفهوم السبب والوتد', description: 'بناء اللبنات الأولى للتفعيلة الشعرية.', difficulty: 'beginner', icon: '🧱' },
    { id: '3', title: 'البحر الطويل', description: 'دراسة تفعيلات فعولن مفاعيلن وتفرعاتها.', difficulty: 'intermediate', icon: '🌊' },
    { id: '4', title: 'البحر البسيط', description: 'مستفعلن فاعلن مستفعلن فاعلن.', difficulty: 'intermediate', icon: '⚖️' },
    { id: '5', title: 'الزحافات والعلل', description: 'التغييرات التي تطرأ على تفعيلات البحور.', difficulty: 'advanced', icon: '⚡' },
    { id: '6', title: 'الضرورات الشعرية', description: 'ما يجوز للشاعر ولا يجوز لغيره.', difficulty: 'advanced', icon: '📜' },
  ];

  const filteredLessons = lessons.filter(l => l.difficulty === difficultyLevel);

  const levelLabels = {
    beginner: { label: 'مبتدئ', color: 'bg-green-100 text-green-700 border-green-200' },
    intermediate: { label: 'متوسط', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    advanced: { label: 'متقدم', color: 'bg-red-100 text-red-700 border-red-200' }
  };

  return (
    <div className="space-y-8 pb-10">
      {showAssessment && (
        <AssessmentView 
          onClose={() => setShowAssessment(false)} 
          level={difficultyLevel === 'beginner' ? 'مبتدئ' : difficultyLevel === 'intermediate' ? 'متوسط' : 'متقدم'} 
        />
      )}

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">أكاديمية عروضي</h2>
          <div className={`px-4 py-1.5 rounded-full text-xs font-black border-2 ${levelLabels[difficultyLevel].color}`}>
             {levelLabels[difficultyLevel].label}
          </div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-2xl">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficultyLevel(level)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                difficultyLevel === level
                  ? 'bg-white text-emerald-900 shadow-sm scale-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {levelLabels[level].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setShowAssessment(true)}
          className="bg-white p-5 rounded-3xl border border-emerald-100 flex flex-col items-center text-center group hover:bg-emerald-50 transition-all hover:shadow-lg active:scale-95"
        >
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧠</span>
          <span className="text-[11px] font-black text-emerald-800 uppercase">اختبار المعارف</span>
          <span className="text-[9px] text-emerald-600/60 mt-1">قياس الفهم النظري</span>
        </button>
        <button 
          onClick={() => setShowAssessment(true)}
          className="bg-white p-5 rounded-3xl border border-amber-100 flex flex-col items-center text-center group hover:bg-amber-50 transition-all hover:shadow-lg active:scale-95"
        >
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎯</span>
          <span className="text-[11px] font-black text-amber-800 uppercase">اختبار المهارات</span>
          <span className="text-[9px] text-amber-600/60 mt-1">التطبيق العملي للوزن</span>
        </button>
      </div>

      {/* Arabic Meters Reference Section */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl">🧭</div>
          <div>
            <h3 className="font-bold text-emerald-900">دليل بحور الشعر العربي</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">الستة عشر بحراً ونظام الدوائر</p>
          </div>
        </div>
        
        <p className="text-[11px] text-gray-600 leading-relaxed mb-6 italic bg-gray-50 p-4 rounded-2xl border-r-4 border-amber-400">
          وضع الخليل بن أحمد الفراهيدي خمس دوائر عروضية حصرت خمسة عشر بحراً، ثم زاد الأخفش بحر "المتدارك" (أو المحدث) لتكتمل ستة عشر بحراً.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {arabicMeters.map((meter, i) => (
            <div key={i} className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl flex flex-col items-center justify-center text-center group hover:bg-emerald-100 transition-colors">
              <span className="text-[10px] font-black text-emerald-700/30 mb-1">{i + 1}</span>
              <span className="text-xs font-bold text-emerald-900 poetry-font">{meter}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1">المسار التعليمي المقترح:</h3>
        <div className="grid grid-cols-1 gap-4">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-300 transition-all cursor-pointer group flex items-center space-x-4 space-x-reverse">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {lesson.icon}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{lesson.description}</p>
              </div>
              <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                ◀
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-900 text-white p-6 rounded-[2.5rem] relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">تحدي اليوم! <span className="animate-bounce">⚔️</span></h3>
          <p className="text-sm text-emerald-100 mb-4 opacity-80">هل يمكنك تحديد البحر الشعري لهذا البيت؟</p>
          <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl text-center poetry-font text-xl mb-5 italic border border-white/10">
            "إذا الشعب يوماً أراد الحياة.. فلا بد أن يستجيب القدر"
          </div>
          <button 
            onClick={() => setShowAssessment(true)}
            className="w-full bg-amber-400 text-emerald-950 font-black px-6 py-3 rounded-xl text-sm hover:bg-amber-300 transition-all active:scale-95 shadow-lg shadow-amber-900/20"
          >
            بدء التحدي (+50 XP)
          </button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-800 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full opacity-30 blur-2xl"></div>
      </div>
    </div>
  );
};

export default LearningView;
