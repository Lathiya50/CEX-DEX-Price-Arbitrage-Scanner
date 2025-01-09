//src/app/page.js

"use client";
import React, { useState, useEffect } from "react";
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
import {
  TrendingUp,
  DollarSign,
  Activity,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { format, subDays, subMonths, subWeeks } from "date-fns";
import StatsCard from "@/components/StatsCard";
import OpportunityCard from "@/components/OpportunityCard";
import PredictionDashboard from "@/components/PredictionDashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Home = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedPair, setSelectedPair] = useState("BTCUSDC");
  const [timeRange, setTimeRange] = useState("15min");
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalOpportunities: 0,
    avgProfit: 0,
    bestOpportunity: 0,
  });
  const [wsStatus, setWsStatus] = useState({
    connected: false,
    lastUpdate: null,
    retryCount: 0,
  });

  // Fetch historical data based on time range
  const fetchHistoricalData = async () => {
    const now = new Date();
    let startTime;

    switch (timeRange) {
      case "15min":
        startTime = new Date(now.getTime() - 15 * 60 * 1000);
        break;
      case "30min":
        startTime = new Date(now.getTime() - 30 * 60 * 1000);
        break;
      case "1hr":
        startTime = subHours(now, 1);
        break;
      case "2hr":
        startTime = subHours(now, 2);
        break;
      case "1D":
        startTime = subDays(now, 1);
        break;
      case "2D":
        startTime = subDays(now, 2);
        break;
      case "1W":
        startTime = subWeeks(now, 1);
        break;
      case "1M":
        startTime = subMonths(now, 1);
        break;
      default:
        startTime = subDays(now, 1);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/arbitrage/historical?symbol=${selectedPair}&startTime=${startTime.toISOString()}&endTime=${now.toISOString()}`
      );
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  // Fetch initial opportunities
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [opportunitiesRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/arbitrage/opportunities`),
          fetch(`${API_BASE_URL}/api/arbitrage/stats`),
        ]);

        const opportunities = await opportunitiesRes.json();
        const stats = await statsRes.json();

        setOpportunities(opportunities);
        updateStats(stats);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch historical data when pair or time range changes
  useEffect(() => {
    fetchHistoricalData();
  }, [selectedPair, timeRange]);

  // WebSocket connection
  useEffect(() => {
    let ws;
    const connectWebSocket = () => {
      ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);

      ws.onopen = () => {
        setWsStatus((prev) => ({
          ...prev,
          connected: true,
          retryCount: 0,
        }));
        ws.send(JSON.stringify({ type: "SUBSCRIBE_PAIR", pair: selectedPair }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
        setWsStatus((prev) => ({
          ...prev,
          lastUpdate: new Date(),
        }));
      };

      ws.onclose = () => {
        setWsStatus((prev) => ({
          ...prev,
          connected: false,
          retryCount: prev.retryCount + 1,
        }));
        setTimeout(
          connectWebSocket,
          Math.min(1000 * Math.pow(2, wsStatus.retryCount), 30000)
        );
      };
    };

    connectWebSocket();
    return () => ws?.close();
  }, [selectedPair]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case "ARBITRAGE_OPPORTUNITY":
        setOpportunities((prev) => {
          const newOpportunities = [data.data, ...prev].slice(0, 100);
          return newOpportunities;
        });
        setHistoricalData((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            profitPercentage: data.data.profitPercentage,
            symbol: data.data.symbol,
          },
        ]);
        break;
      default:
        console.log("Unknown message type:", data.type);
    }
  };

  const updateStats = (statsData) => {
    setStats({
      totalProfit: statsData.reduce((acc, curr) => acc + curr.avgProfit, 0),
      totalOpportunities: statsData.reduce(
        (acc, curr) => acc + curr.totalOpportunities,
        0
      ),
      avgProfit:
        statsData.reduce((acc, curr) => acc + curr.avgProfit, 0) /
        statsData.length,
      bestOpportunity: Math.max(...statsData.map((s) => s.maxProfit)),
    });
  };

  const timeRangeMapping = (range) => {
    const mapping = {
      "15min": "15 Minutes",
      "30min": "30 Minutes",
      "1hr": "1 Hour",
      "2hr": "2 Hours",
      "1D": "1 Day",
      "1W": "1 Week",
    };
    return mapping[range] || range;
  };
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-800">
                Arbitrage Scanner
              </h1>
              <div className="ml-8 flex items-center space-x-4">
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-white border border-indigo-500 hover:border-indigo-600 px-4 py-2 pr-10 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                  >
                    <option value="BTCUSDC">BTC/USDC</option>
                    <option value="ETHUSDC">ETH/USDC</option>
                    <option value="SOLUSDC">SOL/USDC</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-white border border-indigo-500 hover:border-indigo-600 px-4 py-2 pr-10 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="15min">15 Minutes</option>
                    <option value="30min">30 Minutes</option>
                    <option value="1hr">1 Hour</option>
                    <option value="2hr">2 Hours</option>
                    <option value="1D">1 Day</option>
                    <option value="1W">1 Week</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {wsStatus.connected ? (
                  <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                )}
                <span className="text-sm text-slate-600">
                  {wsStatus.connected ? "Live" : "Reconnecting..."}
                </span>
              </div>
              {wsStatus.lastUpdate && (
                <span className="text-sm text-slate-500">
                  Last update:{" "}
                  {new Date(wsStatus.lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="24h Volume"
            value={`$${(stats.totalProfit || 0).toLocaleString()}`}
            icon={DollarSign}
            trend={5.2}
          />
          <StatsCard
            title="Active Opportunities"
            value={opportunities.length}
            icon={Activity}
          />
          <StatsCard
            title="Avg Profit"
            value={`${(stats.avgProfit || 0).toFixed(2)}%`}
            icon={TrendingUp}
            trend={2.1}
          />
          <StatsCard
            title="Best Opportunity"
            value={`${(stats.bestOpportunity || 0).toFixed(2)}%`}
            icon={TrendingUp}
            trend={8.4}
          />
        </div>

        {/* Chart and Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Profit Trends ({timeRangeMapping(timeRange)})
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(time) => format(new Date(time), "HH:mm")}
                      stroke="#64748b"
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      labelFormatter={(label) =>
                        format(new Date(label), "MMM dd, HH:mm")
                      }
                      formatter={(value) => [`${value.toFixed(2)}%`, "Profit"]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profitPercentage"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                      name="Profit %"
                      activeDot={{ r: 4, fill: "#6366f1" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Live Opportunities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Live Opportunities
              </h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {opportunities.map((opp, index) => (
                  <OpportunityCard key={index} opportunity={opp} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <PredictionDashboard symbol={selectedPair} />
      </main>
    </div>
  );
};

export default Home;
