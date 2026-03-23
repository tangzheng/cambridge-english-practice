import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryRecord } from '../types';

export function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('word-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      starters: 'Starters',
      movers: 'Movers',
      flyers: 'Flyers',
    };
    return labels[level] || level;
  };

  const categoryLabels: Record<string, string> = {
    all: '全部',
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

  const clearHistory = () => {
    localStorage.removeItem('word-history');
    setHistory([]);
  };

  // Calculate stats
  const totalWords = history.reduce((sum, h) => sum + h.wordsReviewed, 0);
  const totalCorrect = history.reduce((sum, h) => sum + h.wordsLearned, 0);
  const overallAccuracy = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 返回首页
          </button>
          <h1 className="text-2xl font-bold text-gray-800">学习进度</h1>
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-red-500 hover:text-red-600 transition-colors"
          >
            清空记录
          </button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{history.length}</div>
            <div className="text-sm text-gray-500">测验次数</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{totalWords}</div>
            <div className="text-sm text-gray-500">答题总数</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{overallAccuracy}%</div>
            <div className="text-sm text-gray-500">正确率</div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">还没有学习记录</h2>
            <p className="text-gray-500 mb-6">快去背几个单词吧！</p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              开始学习
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => {
              const percentage = Math.round((record.wordsLearned / record.wordsReviewed) * 100);
              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mr-2">
                          {getLevelLabel(record.level)}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {categoryLabels[record.category] || record.category}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">{formatDate(record.date)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {record.wordsLearned}/{record.wordsReviewed}
                      </div>
                      <div
                        className={`text-sm ${
                          percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}
                      >
                        {percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
