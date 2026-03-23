import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WordCard } from '../components/WordCard';
import { getWordsByLevel, getWordsByLevelAndCategory } from '../data/words';
import { Level, WordCategory } from '../types';

export function Study() {
  const { level, category } = useParams<{ level: string; category?: string }>();
  const navigate = useNavigate();

  const words = category && category !== 'all'
    ? getWordsByLevelAndCategory(level as Level, category as WordCategory)
    : getWordsByLevel(level as Level);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`learned-${level}${category ? `-${category}` : ''}`);
    if (saved) {
      setLearnedWords(new Set(JSON.parse(saved)));
    }
  }, [level, category]);

  const saveProgress = (learned: Set<string>) => {
    localStorage.setItem(
      `learned-${level}${category ? `-${category}` : ''}`,
      JSON.stringify(Array.from(learned))
    );
  };

  const currentWord = words[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setShowComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkLearned = () => {
    const newLearned = new Set(learnedWords);
    newLearned.add(currentWord.id);
    setLearnedWords(newLearned);
    saveProgress(newLearned);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowComplete(false);
  };

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">暂无词汇</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    animals: '🐾 动物',
    colors: '🎨 颜色',
    numbers: '🔢 数字',
    food: '🍎 食物',
    verbs: '🏃 动词',
    nature: '🌍 自然',
    emotions: '😊 情感',
    science: '🔬 科学',
    family: '👨‍👩‍👧 家人',
    body: '🧍 身体',
    objects: '📦 物品',
    adjectives: '✨ 形容词',
    places: '🏢 地点',
    time: '⏰ 时间',
    society: '🏛️ 社会',
  };

  if (showComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">太棒了！</h1>
            <p className="text-lg text-gray-600 mb-6">
              你已经学完了 {level?.toUpperCase()} {category && category !== 'all' ? categoryLabels[category] : '全部'} 词汇！
            </p>
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 mb-6 text-white">
              <div className="text-4xl font-bold mb-2">
                {learnedWords.size} / {words.length}
              </div>
              <div className="text-lg">已掌握词汇</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                再学一遍
              </button>
              <button
                onClick={() => navigate(`/quiz/${level}${category && category !== 'all' ? `/${category}` : ''}`)}
                className="px-8 py-3 bg-yellow-400 text-yellow-800 rounded-full hover:bg-yellow-500 transition-colors"
              >
                🏓 开始测验
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 退出
          </button>
          <div className="text-sm text-gray-500">
            {level?.toUpperCase()} · {category && category !== 'all' ? categoryLabels[category] : '全部'}
          </div>
          <div className="text-sm text-green-600 font-medium">
            ✓ {learnedWords.size} 已学
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>

        <div className="text-center text-sm text-gray-500 mb-2">
          {currentIndex + 1} / {words.length}
        </div>

        <WordCard
          word={currentWord}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleMarkLearned}
            className={`px-6 py-3 rounded-full transition-colors ${
              learnedWords.has(currentWord.id)
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {learnedWords.has(currentWord.id) ? '✓ 已掌握' : '✓ 标记已学'}
          </button>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-6 py-3 rounded-full transition-colors ${
              currentIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← 上一张
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
          >
            {currentIndex === words.length - 1 ? '完成学习' : '下一张 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
