import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWordsByLevel, getWordsByLevelAndCategory } from '../data/words';
import { Level, WordCategory, Word } from '../types';

type QuizType = 'word-to-meaning' | 'meaning-to-word';

export function Quiz() {
  const { level, category } = useParams<{ level: string; category?: string }>();
  const navigate = useNavigate();

  const [allWords] = useState<Word[]>(() =>
    category && category !== 'all'
      ? getWordsByLevelAndCategory(level as Level, category as WordCategory)
      : getWordsByLevel(level as Level)
  );

  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizType, setQuizType] = useState<QuizType>('word-to-meaning');
  const [options, setOptions] = useState<string[]>([]);

  const isInitialMount = useRef(true);

  // Initialize quiz on mount
  useEffect(() => {
    if (isInitialMount.current && allWords.length > 0) {
      const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, Math.min(10, allWords.length));
      setQuizWords(shuffled);
      isInitialMount.current = false;
    }
  }, [allWords]);

  // Generate options when current word changes
  useEffect(() => {
    if (quizWords.length === 0 || currentIndex >= quizWords.length) return;

    const currentWord = quizWords[currentIndex];
    const otherWords = allWords.filter(w => w.id !== currentWord.id);

    const correct = quizType === 'word-to-meaning' ? currentWord.meaning : currentWord.word;
    const wrongOptions = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => quizType === 'word-to-meaning' ? w.meaning : w.word);

    const newOptions = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
    setOptions(newOptions);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [currentIndex, quizWords, quizType, allWords]);

  const handleSelectAnswer = (answer: string) => {
    if (showResult || !currentWord) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const correctAnswer = quizType === 'word-to-meaning' ? currentWord.meaning : currentWord.word;
    if (answer === correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const record = {
        id: Date.now().toString(),
        level: level as Level,
        category: (category || 'all') as WordCategory,
        date: new Date().toISOString(),
        wordsLearned: correctCount,
        wordsReviewed: quizWords.length,
      };

      const saved = localStorage.getItem('word-history');
      const history = saved ? JSON.parse(saved) : [];
      history.unshift(record);
      localStorage.setItem('word-history', JSON.stringify(history.slice(0, 20)));

      navigate('/quiz-result', {
        state: {
          score: correctCount,
          total: quizWords.length,
          level,
          category,
        },
      });
    }
  };

  const toggleQuizType = () => {
    setQuizType(prev => prev === 'word-to-meaning' ? 'meaning-to-word' : 'word-to-meaning');
    setCurrentIndex(0);
    setCorrectCount(0);
  };

  if (allWords.length === 0) {
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

  if (quizWords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">加载题目中...</p>
        </div>
      </div>
    );
  }

  const currentWord = quizWords[currentIndex];
  const correctAnswer = quizType === 'word-to-meaning' ? currentWord.meaning : currentWord.word;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 px-4">
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
          <button
            onClick={toggleQuizType}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full"
          >
            {quizType === 'word-to-meaning' ? '英→中' : '中→英'}
          </button>
        </div>

        <div className="w-full bg-white rounded-full h-3 mb-6 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / quizWords.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 mb-2">
              第 {currentIndex + 1} 题 / 共 {quizWords.length} 题
            </div>
            {quizType === 'word-to-meaning' ? (
              <>
                <div className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</div>
                <div className="text-gray-400">{currentWord.phonetic}</div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-gray-800 mb-2">{currentWord.meaning}</div>
                <div className="text-gray-400">选择对应的英文单词</div>
              </>
            )}
          </div>

          <div className="space-y-3">
            {options.map((option, index) => {
              let bgClass = 'bg-white hover:bg-blue-50 border-gray-200';
              let textClass = 'text-gray-800';

              if (showResult) {
                if (option === correctAnswer) {
                  bgClass = 'bg-green-100 border-green-500';
                  textClass = 'text-green-700';
                } else if (option === selectedAnswer) {
                  bgClass = 'bg-red-100 border-red-500';
                  textClass = 'text-red-700';
                }
              } else if (selectedAnswer === option) {
                bgClass = 'bg-blue-100 border-blue-500';
              }

              return (
                <button
                  key={`q${currentIndex}-o${index}`}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-lg ${bgClass} ${textClass}`}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-4 p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
              <p className="text-gray-700">
                <span className="font-bold">{currentWord.word}</span> {currentWord.phonetic}
              </p>
              <p className="text-gray-600 mt-1">{currentWord.meaning}</p>
              <p className="text-gray-500 italic mt-2 text-sm">"{currentWord.example}"</p>
            </div>
          )}
        </div>

        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-blue-500 text-white rounded-xl text-lg font-medium hover:bg-blue-600 transition-colors shadow-lg"
          >
            {currentIndex < quizWords.length - 1 ? '下一题 →' : '查看结果'}
          </button>
        )}

        <div className="text-center mt-4 text-sm text-gray-500">
          已答: {currentIndex + (showResult ? 1 : 0)} / {quizWords.length} | 正确: {correctCount}
        </div>
      </div>
    </div>
  );
}
