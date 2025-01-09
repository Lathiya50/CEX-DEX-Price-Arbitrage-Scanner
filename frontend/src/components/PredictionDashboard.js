import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { Brain, TrendingUp, BarChart3, Target } from "lucide-react";

const PredictionDashboard = ({ symbol = "BTCUSDC" }) => {
  const [predictions, setPredictions] = useState([]);
  const [modelStats, setModelStats] = useState({
    accuracy: 0,
    totalPredictions: 0,
    avgConfidence: 0,
  });
  const [latestPrediction, setLatestPrediction] = useState(null);

  useEffect(() => {
    // Fetch initial predictions
    fetchPredictions();
    fetchModelStats();

    // Set up WebSocket connection for live updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_PREDICTION") {
        handleNewPrediction(data.data);
      }
    };

    return () => ws.close();
  }, [symbol]);

  const fetchPredictions = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/prediction/predictions?symbol=${symbol}&limit=100`
      );
      const data = await response.json();
      setPredictions(data);
      if (data.length > 0) {
        setLatestPrediction(data[0]);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  const fetchModelStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/prediction/stats`
      );
      const data = await response.json();
      const symbolStats = data.find((stat) => stat.symbol === symbol) || {
        accuracy: 0,
        totalPredictions: 0,
        avgConfidence: 0,
      };
      setModelStats(symbolStats);
    } catch (error) {
      console.error("Error fetching model stats:", error);
    }
  };

  const handleNewPrediction = (prediction) => {
    setPredictions((prev) => [prediction, ...prev].slice(0, 100));
    setLatestPrediction(prediction);
  };

  const confidenceColor = (confidence) => {
    if (confidence >= 0.7) return "text-emerald-600";
    if (confidence >= 0.5) return "text-yellow-600";
    return "text-rose-600";
  };
  console.log("predictions", predictions);
  return (
    <div className="space-y-6">
      {/* Latest Prediction Alert */}
      {latestPrediction && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Latest Prediction
                </h3>
                <p className="text-sm text-slate-600">
                  {format(
                    new Date(latestPrediction.timestamp),
                    "MMM dd, HH:mm:ss"
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">
                {latestPrediction.predictedDirection ? "▲" : "▼"}
                <span className={confidenceColor(latestPrediction.confidence)}>
                  {(latestPrediction.confidence * 100).toFixed(1)}%
                </span>
              </p>
              <p className="text-sm text-slate-600">Confidence</p>
            </div>
          </div>
        </div>
      )}

      {/* Model Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-medium text-slate-600">
              Model Accuracy
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {modelStats.accuracy.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-medium text-slate-600">
              Total Predictions
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {modelStats.totalPredictions.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-medium text-slate-600">
              Avg Confidence
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {(modelStats.avgConfidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Prediction History Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Prediction History
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={[...predictions].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => format(new Date(time), "HH:mm")}
                stroke="#64748b"
              />
              <YAxis yAxisId="price" stroke="#64748b" />
              <YAxis
                yAxisId="confidence"
                orientation="right"
                stroke="#64748b"
              />
              <Tooltip
                labelFormatter={(label) =>
                  format(new Date(label), "MMM dd, HH:mm")
                }
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px",
                }}
              />
              <Legend />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="currentPrice"
                stroke="#6366f1"
                name="Price"
                dot={false}
              />
              <Area
                yAxisId="confidence"
                type="monotone"
                dataKey="confidence"
                fill="#818cf8"
                fillOpacity={0.3}
                stroke="#818cf8"
                name="Confidence"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PredictionDashboard;
