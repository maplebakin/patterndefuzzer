// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import PatternList from './pages/PatternList.jsx';
import PatternDetail from './pages/PatternDetail.jsx';

export default function App() {
  return (
    <main>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Patterns list */}
        <Route path="/patterns" element={<PatternList />} />

        {/* Single pattern detail */}
        <Route path="/patterns/:id" element={<PatternDetail />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<div style={{ padding: '2rem', color: '#eee' }}>Page not found.</div>} />
      </Routes>
    </main>
  );
}
