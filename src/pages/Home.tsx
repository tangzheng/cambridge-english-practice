import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Level, WordCategory } from '../types';
import { getCategoriesByLevel } from '../data/words';

type SelectionStep = 'level' | 'category';

export function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SelectionStep>('level');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const levels: { level: Level; name: string; description: string; color: string; emoji: string }[] = [
    { level: 'starters', name: 'Starters', description: '适合6-8岁 · 基础词汇', color: 'bg-green-500', emoji: '🌟' },
    { level: 'movers', name: 'Movers', description: '适合8-11岁 · 进阶词汇', color: 'bg-yellow-500', emoji: '🌱' },
    { level: 'flyers', name: 'Flyers', description: '适合11-14岁 · 高级词汇', color: 'bg-red-500', emoji: '🚀' },
  ];

  const categoryLabels: Record<WordCategory, { name: string; emoji: string }> = {
    animals: { name: '动物', emoji: '🐾' },
    colors: { name: '颜色', emoji: '🎨' },
    numbers: { name: '数字', emoji: '🔢' },
    food: { name: '食物', emoji: '🍎' },
    verbs: { name: '动词', emoji: '🏃' },
    nature: { name: '自然', emoji: '🌍' },
    emotions: { name: '情感', emoji: '😊' },
    science: { name: '科学', emoji: '🔬' },
    family: { name: '家人', emoji: '👨‍👩‍👧' },
    body: { name: '身体', emoji: '🧍' },
    objects: { name: '物品', emoji: '📦' },
    adjectives: { name: '形容词', emoji: '✨' },
    places: { name: '地点', emoji: '🏢' },
    time: { name: '时间', emoji: '⏰' },
    society: { name: '社会', emoji: '🏛️' },
    prepositions: { name: '介词/方向', emoji: '↔️' },
    people: { name: '人物', emoji: '👥' },
    actions: { name: '动作/其他', emoji: '🎯' },
  };

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setStep('category');
  };

  const handleSelectCategory = (category: WordCategory | 'all') => {
    if (category === 'all') {
      navigate(`/study/${selectedLevel}`);
    } else {
      navigate(`/study/${selectedLevel}/${category}`);
    }
  };

  const handleBack = () => {
    if (step === 'category') {
      setStep('level');
      setSelectedLevel(null);
    }
  };

  const categories = selectedLevel ? getCategoriesByLevel(selectedLevel) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            剑桥少儿英文背单词
          </h1>
          <p className="text-lg text-gray-600">
            {step === 'level' ? '选择你的级别' : `选择 ${selectedLevel?.toUpperCase()} 词汇类别`}
          </p>
        </div>

        {step === 'level' ? (
          <div className="space-y-4">
            {levels.map(({ level, name, description, color, emoji }) => (
              <button
                key={level}
                onClick={() => handleSelectLevel(level)}
                className="w-full p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group"
              >
                <div className="flex items-center">
                  <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-3xl mr-6 group-hover:scale-110 transition-transform`}>
                    {emoji}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{name}</h2>
                    <p className="text-gray-500">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <button
              onClick={handleBack}
              className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            >
              <span className="mr-2">←</span> 返回选择级别
            </button>
            <div className="space-y-4">
              <button
                onClick={() => handleSelectCategory('all')}
                className="w-full p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left text-white"
              >
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mr-6">
                    📚
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">全部词汇</h2>
                    <p className="text-white/80">学习所有类别</p>
                  </div>
                </div>
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleSelectCategory(category)}
                  className="w-full p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl mr-6 group-hover:scale-110 transition-transform">
                      {categoryLabels[category].emoji}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-1">
                        {categoryLabels[category].name}
                      </h2>
                      <p className="text-gray-500">
                        {categoryLabels[category].emoji} {category}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-12 text-center flex gap-4 justify-center">
          <button
            onClick={() => navigate('/quiz/starters')}
            className="px-8 py-3 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
          >
            🏓 开始测验
          </button>
          <button
            onClick={() => navigate('/history')}
            className="px-8 py-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            查看进度
          </button>
        </div>
      </div>
    </div>
  );
}
