import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Heart, Car, FlaskConical, Wheat } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutGrid, label: 'Overview' },
    { path: '/health', icon: Heart, label: 'Health' },
    { path: '/traffic', icon: Car, label: 'Traffic' },
    { path: '/simulation', icon: FlaskConical, label: 'Simulation' },
    { path: '/agriculture', icon: Wheat, label: 'Agriculture' },
  ];

  return (
    <div className="w-24 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 space-y-8">
      {/* Logo */}
      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-3">
        <div className="w-8 h-8 border-2 border-white rounded-full"></div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;