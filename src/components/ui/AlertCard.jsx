import { AlertTriangle } from 'lucide-react';

const AlertCard = ({ alerts }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
      <h3 className="text-xl font-bold text-white mb-4">Critical Alerts</h3>
      
      <div className="space-y-3">
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-white font-medium">{alert.title}</p>
              {alert.subtitle && <p className="text-slate-400 text-sm">{alert.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertCard;