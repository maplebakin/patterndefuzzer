// frontend/src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import PatternList from './pages/PatternList.jsx';
import PatternDetail from './pages/PatternDetail.jsx';

export default function App() {
  return (
    <div>
      <header style={{ marginBottom: '1.5rem', background: '#222', padding: '1rem', color: '#eee' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Pattern Defuzzer</h1>
        <nav style={{ marginTop: 12 }}>
          <Link to="/" style={{ marginRight: 14, color: '#78e6d6' }}>Home</Link>
          <Link to="/patterns" style={{ color: '#78e6d6' }}>My Patterns</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patterns" element={<PatternList />} />
          <Route path="/patterns/:id" element={<PatternDetail />} />
        </Routes>
      </main>
    </div>
  );
}
