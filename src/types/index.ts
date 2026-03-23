export type Level = 'starters' | 'movers' | 'flyers';
export type WordCategory = 'animals' | 'colors' | 'numbers' | 'food' | 'verbs' | 'nature' | 'emotions' | 'science' | 'family' | 'body' | 'objects' | 'adjectives' | 'places' | 'time' | 'society' | 'prepositions' | 'people' | 'actions';

export interface Word {
  id: string;
  level: Level;
  category: WordCategory;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  image?: string;
}

export interface StudyState {
  currentIndex: number;
  learnedWords: string[];
  isFlipped: boolean;
}

export interface HistoryRecord {
  id: string;
  level: Level;
  category: WordCategory;
  date: string;
  wordsLearned: number;
  wordsReviewed: number;
}
