// src/components/OpportunityCard.js
const OpportunityCard = ({ opportunity }) => (
  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-indigo-500 hover:bg-white transition-all">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="font-medium text-slate-800">{opportunity.symbol}</h3>
        <p className="text-sm text-slate-500">
          {new Date(opportunity.timestamp).toLocaleTimeString()}
        </p>
      </div>
      <div className="text-right">
        <p
          className={`text-lg font-semibold ${
            opportunity.profitPercentage > 0
              ? "text-emerald-600"
              : "text-rose-600"
          }`}
        >
          {opportunity.profitPercentage > 0 ? "+" : ""}
          {opportunity.profitPercentage?.toFixed(2)}%
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div>
        <p className="text-sm text-slate-500">Binance</p>
        <p className="font-medium text-slate-800">
          ${opportunity.binancePrice?.toFixed(2)}
        </p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Solana DEX</p>
        <p className="font-medium text-slate-800">
          ${opportunity.dexPrice?.toFixed(2)}
        </p>
      </div>
    </div>
  </div>
);

export default OpportunityCard;
