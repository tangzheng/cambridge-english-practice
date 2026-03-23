import { Word } from '../types';

interface WordCardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
}

export function WordCard({ word, isFlipped, onFlip }: WordCardProps) {
  const categoryLabels: Record<string, string> = {
    animals: '🐾 动物',
    colors: '🎨 颜色',
    numbers: '🔢 数字',
    food: '🍎 食物',
    verbs: '🏃 动词',
    nature: '🌍 自然',
    emotions: '😊 情感',
    science: '🔬 科学',
  };

  return (
    <div className="perspective-1000">
      <div
        onClick={onFlip}
        className={`relative w-full h-80 cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : '' }}
      >
        {/* Front - Word */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {word.image && <span className="text-7xl mb-4">{word.image}</span>}
          <h2 className="text-4xl font-bold text-white mb-2">{word.word}</h2>
          <p className="text-blue-100 text-lg">{word.phonetic}</p>
          <p className="text-blue-200 text-sm mt-2">{categoryLabels[word.category]}</p>
          <p className="text-white/60 text-sm mt-6">点击查看中文释义</p>
        </div>

        {/* Back - Meaning */}
        <div
          className="absolute w-full h-full bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-6xl mb-4">{word.image}</span>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">{word.meaning}</h2>
          <p className="text-gray-500 text-lg mb-4">{word.word}</p>
          <div className="bg-yellow-50 rounded-xl p-4 mt-2 w-full">
            <p className="text-sm text-gray-500 mb-1">例句:</p>
            <p className="text-gray-700 italic">{word.example}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
