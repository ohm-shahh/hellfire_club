import { Calendar, User } from 'lucide-react';
import CitySelector from '../ui/CitySelector';

const Header = ({ title }) => {
  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
      {/* Title */}
      <h1 className="text-2xl font-bold text-white">{title}</h1>

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        {/* City Selector (NEW - replaces static location) */}
        <CitySelector />

        {/* Date Range */}
        <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-700 transition-all duration-300 cursor-pointer">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-white">Oct 1 - Oct 7</span>
        </div>

        {/* User Avatar */}
        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-all duration-300 cursor-pointer hover:scale-110">
          <User className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
