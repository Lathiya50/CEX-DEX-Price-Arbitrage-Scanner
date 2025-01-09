// src/components/PriceChart.js
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const PriceChart = ({ data, symbol }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleString()}
            formatter={(value) => [`${value.toFixed(2)}%`, "Profit"]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="profitPercentage"
            stroke="#8884d8"
            name={`${symbol} Profit %`}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
