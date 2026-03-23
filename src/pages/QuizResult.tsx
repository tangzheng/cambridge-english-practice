import { useLocation, useNavigate } from 'react-router-dom';

export function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, level, category } = location.state as {
    score: number;
    total: number;
    level: string;
    category: string;
  };

  const percentage = Math.round((score / total) * 100);

  const getResultMessage = () => {
    if (percentage >= 90) return { text: '太棒了！满分！', emoji: '🌟' };
    if (percentage >= 70) return { text: '很不错！继续加油！', emoji: '😊' };
    if (percentage >= 50) return { text: '还行哦！多练习！', emoji: '💪' };
    return { text: '加油！多背几个单词！', emoji: '📚' };
  };

  const result = getResultMessage();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">{result.emoji}</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{result.text}</h1>
          <p className="text-lg text-gray-600 mb-8">
            {level?.toUpperCase()} {category && category !== 'all' ? categoryLabels[category] : '全部'} 词汇测验
          </p>

          <div className={`rounded-2xl p-6 mb-8 ${
            percentage >= 70 ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          } text-white`}>
            <div className="text-6xl font-bold mb-2">{percentage}%</div>
            <div className="text-xl">
              {score} / {total} 正确
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/quiz/${level}${category ? `/${category}` : ''}`)}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              🔄 再测一次
            </button>
            <button
              onClick={() => navigate(`/study/${level}${category ? `/${category}` : ''}`)}
              className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              📖 再学习一遍
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              🏠 返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
