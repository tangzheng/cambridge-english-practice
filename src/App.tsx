import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Study } from './pages/Study';
import { Quiz } from './pages/Quiz';
import { QuizResult } from './pages/QuizResult';
import { History } from './pages/History';

function App() {
  return (
    <BrowserRouter basename="/cambridge-english-practice">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/study/:level/:category?" element={<Study />} />
        <Route path="/quiz/:level/:category?" element={<Quiz />} />
        <Route path="/quiz-result" element={<QuizResult />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
