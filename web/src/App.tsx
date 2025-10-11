import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import SteamIdGuide from './pages/SteamIdGuide';
import SaveFileGuide from './pages/SaveFileGuide';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/steam-id" element={<SteamIdGuide />} />
      <Route path="/save-location" element={<SaveFileGuide />} />
    </Routes>
  );
}

export default App;
