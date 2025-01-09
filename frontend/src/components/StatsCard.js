// src/components/StatsCard.js

const StatsCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:border-indigo-500 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-5 h-5 text-slate-400" />}
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      </div>
      {trend && (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trend > 0
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
  </div>
);

export default StatsCard;
