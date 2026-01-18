const StatCard = ({ icon: Icon, label, value, subtitle, color = "yellow" }) => {
  const colorClasses = {
    yellow: "bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50",
    red: "bg-red-500/10 border-red-500/30 hover:border-red-500/50",
    green: "bg-green-500/10 border-green-500/30 hover:border-green-500/50",
    orange: "bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50"
  };

  const iconBgClasses = {
    yellow: "bg-yellow-500/20",
    red: "bg-red-500/20",
    green: "bg-green-500/20",
    orange: "bg-orange-500/20"
  };

  const textClasses = {
    yellow: "text-yellow-400",
    red: "text-red-400",
    green: "text-green-400",
    orange: "text-orange-400"
  };

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-${color}-500/20 transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm mb-2">{label}</p>
          <p className={`text-3xl font-bold ${textClasses[color]} mb-1`}>{value}</p>
          {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
        </div>
        
        {Icon && (
          <div className={`${iconBgClasses[color]} p-3 rounded-lg transition-transform duration-300 hover:scale-110`}>
            <Icon className={`w-6 h-6 ${textClasses[color]}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;