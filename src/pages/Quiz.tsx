import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWordsByLevel, getWordsByLevelAndCategory } from '../data/words';
import { Level, WordCategory, Word } from '../types';

export type QuizMode =
  | 'word-meaning'    // 英译中选择题
  | 'meaning-word'    // 中译英选择题
  | 'spelling'        // 拼写填空
  | 'listen'          // 听音选义
  | 'fill-blank'     // 例句填空
  | 'true-false';     // 判断对错

interface QuizConfig {
  mode: QuizMode;
  name: string;
  emoji: string;
  description: string;
}

const quizModes: QuizConfig[] = [
  { mode: 'word-meaning', name: '英译中', emoji: '📖', description: '看英文选中文释义' },
  { mode: 'meaning-word', name: '中译英', emoji: '🔤', description: '看中文选英文单词' },
  { mode: 'spelling', name: '拼写测试', emoji: '✏️', description: '听写英文单词' },
  { mode: 'listen', name: '听力练习', emoji: '🎧', description: '听发音选中文' },
  { mode: 'fill-blank', name: '例句填空', emoji: '📝', description: '补全例句中的单词' },
  { mode: 'true-false', name: '判断对错', emoji: '✅❌', description: '判断中文释义是否正确' },
];

export function Quiz() {
  const { level, category } = useParams<{ level: string; category?: string }>();
  const navigate = useNavigate();

  const [allWords] = useState<Word[]>(() =>
    category && category !== 'all'
      ? getWordsByLevelAndCategory(level as Level, category as WordCategory)
      : getWordsByLevel(level as Level)
  );

  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);

  const isInitialMount = useRef(true);

  // Helper to speak - uses browser TTS with best available voice
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.6; // Much slower for kids
    utterance.pitch = 1.0;

    // Load and select best voice
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      // Priority: native OS voices (Samantha, Karen, Daniel, Ting-Ting) > Google > Microsoft
      const preferredVoice = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Daniel') ||
        v.name.includes('Ting-Ting') ||
        v.name.includes('Google') ||
        v.name.includes('Microsoft')
      ) || voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en')) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.rate = 0.6; // Ensure slow speed
      }
      speechSynthesis.speak(utterance);
    };

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      setVoice();
    } else {
      speechSynthesis.onvoiceschanged = setVoice;
    }
  };

  // Initialize quiz with ALL words when mode is selected
  useEffect(() => {
    if (quizMode && allWords.length > 0 && isInitialMount.current) {
      // Use all words, shuffled
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      setQuizWords(shuffled);
      isInitialMount.current = false;
    }
  }, [quizMode, allWords]);

  // Generate options when current word changes
  useEffect(() => {
    if (quizWords.length === 0 || currentIndex >= quizWords.length || !quizMode) return;

    const currentWord = quizWords[currentIndex];
    const otherWords = allWords.filter(w => w.id !== currentWord.id);

    // Generate options based on mode
    let correct = '';
    let wrongOptions: string[] = [];

    switch (quizMode) {
      case 'word-meaning':
        correct = currentWord.meaning;
        wrongOptions = otherWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.meaning);
        break;
      case 'meaning-word':
        correct = currentWord.word;
        wrongOptions = otherWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.word);
        break;
      case 'listen':
        correct = currentWord.meaning;
        wrongOptions = otherWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.meaning);
        break;
      case 'true-false':
        // Randomly decide if we show correct or wrong meaning
        setTrueFalseAnswer(Math.random() > 0.5);
        correct = currentWord.meaning;
        wrongOptions = otherWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 1)
          .map(w => w.meaning);
        break;
      case 'fill-blank':
        // Create blank in example
        correct = currentWord.word;
        break;
      case 'spelling':
        correct = currentWord.word;
        break;
    }

    if (quizMode !== 'fill-blank' && quizMode !== 'spelling') {
      const newOptions = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
      setOptions(newOptions);
    }

    setSelectedAnswer(null);
    setShowResult(false);
    setUserInput('');
  }, [currentIndex, quizWords, quizMode, allWords]);

  const handleSelectAnswer = (answer: string) => {
    if (showResult || !currentWord) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    let correctAnswer = '';
    switch (quizMode) {
      case 'word-meaning':
      case 'listen':
        correctAnswer = currentWord.meaning;
        break;
      case 'meaning-word':
        correctAnswer = currentWord.word;
        break;
      case 'true-false':
        correctAnswer = trueFalseAnswer ? currentWord.meaning : wrongMeaning;
        break;
    }

    if (answer === correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleSpellingSubmit = () => {
    if (showResult || !currentWord) return;

    setShowResult(true);
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleFillBlankSubmit = () => {
    if (showResult || !currentWord) return;

    setShowResult(true);
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Save to history
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
      localStorage.setItem('word-history', JSON.stringify(history.slice(0, 50)));

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

  const handleStartQuiz = (mode: QuizMode) => {
    isInitialMount.current = true;
    setQuizMode(mode);
    setCurrentIndex(0);
    setCorrectCount(0);
    setShowResult(false);
    setUserInput('');
  };

  const handleBack = () => {
    setQuizMode(null);
    isInitialMount.current = true;
    setQuizWords([]);
  };

  if (!quizMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← 返回首页
            </button>
            <div className="text-lg font-bold text-gray-800">
              {level?.toUpperCase()} · {allWords.length} 词汇
            </div>
            <div className="w-20"></div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            选择测验模式
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {quizModes.map((config) => (
              <button
                key={config.mode}
                onClick={() => handleStartQuiz(config.mode)}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 text-left"
              >
                <div className="text-4xl mb-3">{config.emoji}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{config.name}</h3>
                <p className="text-sm text-gray-500">{config.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center text-gray-500 text-sm">
            共 {allWords.length} 个词汇，全部测验
          </div>
        </div>
      </div>
    );
  }

  if (allWords.length === 0 || quizWords.length === 0) {
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
  const wrongMeaning = allWords
    .filter(w => w.id !== currentWord.id)
    .sort(() => Math.random() - 0.5)[0]?.meaning || '';

  const currentMode = quizModes.find(m => m.mode === quizMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 返回
          </button>
          <div className="text-sm text-gray-500">
            {level?.toUpperCase()} · {currentMode?.emoji} {currentMode?.name}
          </div>
          <div className="text-sm text-green-600 font-medium">
            ✓ {correctCount}
          </div>
        </div>

        <div className="w-full bg-white rounded-full h-3 mb-6 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / quizWords.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 mb-4">
              第 {currentIndex + 1} 题 / 共 {quizWords.length} 题
            </div>

            {/* Word-Meaning Choice */}
            {(quizMode === 'word-meaning' || quizMode === 'meaning-word') && (
              <>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  {quizMode === 'word-meaning' ? currentWord.word : currentWord.meaning}
                </div>
                {quizMode === 'word-meaning' && (
                  <div className="text-gray-400">{currentWord.phonetic}</div>
                )}
                {quizMode === 'meaning-word' && (
                  <div className="text-gray-400">选择对应的英文单词</div>
                )}
              </>
            )}

            {/* Listen Mode */}
            {quizMode === 'listen' && (
              <>
                <div className="text-5xl mb-4">🔊</div>
                <button
                  onClick={() => speak(currentWord.word)}
                  className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  点击听发音
                </button>
                <div className="text-4xl font-bold text-gray-800 mt-4">{currentWord.word}</div>
                <div className="text-gray-400">{currentWord.phonetic}</div>
              </>
            )}

            {/* True-False Mode */}
            {quizMode === 'true-false' && (
              <>
                <div className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</div>
                <div className="text-gray-400">{currentWord.phonetic}</div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-800">
                    {trueFalseAnswer ? currentWord.meaning : wrongMeaning}
                  </div>
                </div>
              </>
            )}

            {/* Fill in Blank Mode */}
            {quizMode === 'fill-blank' && (
              <>
                <div className="text-gray-600 mb-4">补全例句中的单词:</div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-xl text-gray-800">
                    {currentWord.example.replace(new RegExp(currentWord.word, 'gi'), '____')}
                  </p>
                </div>
              </>
            )}

            {/* Spelling Mode */}
            {quizMode === 'spelling' && (
              <>
                <div className="text-5xl mb-4">✏️</div>
                <div className="text-gray-600 mb-4">听发音，写出单词:</div>
                <button
                  onClick={() => speak(currentWord.word)}
                  className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors mb-4"
                >
                  🔊 听发音
                </button>
                <div className="text-2xl font-bold text-gray-800">{currentWord.meaning}</div>
                <div className="text-gray-400">{currentWord.example}</div>
              </>
            )}
          </div>

          {/* Choice Options */}
          {(quizMode === 'word-meaning' || quizMode === 'meaning-word' || quizMode === 'listen') && (
            <div className="space-y-3">
              {options.map((option, index) => {
                let bgClass = 'bg-white hover:bg-blue-50 border-gray-200';
                let textClass = 'text-gray-800';

                if (showResult) {
                  if (option === (quizMode === 'meaning-word' ? currentWord.word : currentWord.meaning)) {
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
                    key={`${currentIndex}-${index}`}
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
          )}

          {/* True-False Options */}
          {quizMode === 'true-false' && !showResult && (
            <div className="flex gap-4">
              <button
                onClick={() => handleSelectAnswer('true')}
                className="flex-1 p-6 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700 text-xl font-bold transition-all"
              >
                ✅ 正确
              </button>
              <button
                onClick={() => handleSelectAnswer('false')}
                className="flex-1 p-6 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xl font-bold transition-all"
              >
                ❌ 错误
              </button>
            </div>
          )}

          {/* Input for Spelling and Fill-blank */}
          {(quizMode === 'spelling' || quizMode === 'fill-blank') && !showResult && (
            <div className="space-y-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (quizMode === 'spelling' ? handleSpellingSubmit() : handleFillBlankSubmit())}
                placeholder="输入你的答案..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-xl text-center"
                autoFocus
              />
              <button
                onClick={quizMode === 'spelling' ? handleSpellingSubmit : handleFillBlankSubmit}
                disabled={!userInput.trim()}
                className={`w-full py-4 rounded-xl text-lg font-medium transition-all ${
                  userInput.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                确认答案
              </button>
            </div>
          )}

          {/* Result Display */}
          {showResult && (
            <div className="mt-4 p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
              <p className="text-gray-700 text-lg">
                <span className="font-bold">{currentWord.word}</span> {currentWord.phonetic}
              </p>
              <p className="text-gray-600">{currentWord.meaning}</p>
              <p className="text-gray-500 italic mt-2 text-sm">"{currentWord.example}"</p>
              {quizMode === 'spelling' && userInput.toLowerCase().trim() !== currentWord.word.toLowerCase() && (
                <p className="text-red-600 mt-2">你的答案: {userInput}</p>
              )}
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
          正确率: {correctCount} / {currentIndex + (showResult ? 1 : 0)}
        </div>
      </div>
    </div>
  );
}
