import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CityProvider } from './context/CityContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AIAssistant from './components/ui/AIAssistant';
import Overview from './pages/Overview';
import Health from './pages/Health';
import Traffic from './pages/Traffic';
import Simulation from './pages/Simulation';
import Agriculture from './pages/Agriculture';
import NotFound from './pages/NotFound';

function AppContent() {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title="Smart City Dashboard" />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/health" element={<Health />} />
            <Route path="/traffic" element={<Traffic />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/agriculture" element={<Agriculture />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CityProvider>
        <AppContent />
      </CityProvider>
    </BrowserRouter>
  );
}

export default App;
