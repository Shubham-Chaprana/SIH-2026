import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import CommandCentre from './pages/CommandCentre';
import PriorityQueue from './pages/PriorityQueue';
import Analytics from './pages/Analytics';
import Intelligence from './pages/Intelligence';
import Investigator from './pages/Investigator';
import SystemHealth from './pages/SystemHealth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<CommandCentre />} />
          <Route path="/map" element={<CommandCentre />} />
          <Route path="/priority" element={<PriorityQueue />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/investigator" element={<Investigator />} />
          <Route path="/system" element={<SystemHealth />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
