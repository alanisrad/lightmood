"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A28EFF", "#FF5F7E", "#60D394", "#FFA07A",
  "#B0E0E6", "#D87093",
];

type EmotionChartProps = {
  data: Record<string, number>; // e.g., { happy: 40, sad: 20, calm: 40 }
};

export default function EmotionChart({ data }: EmotionChartProps) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-6 mb-8">
      <h3 className="text-lg font-semibold text-center mb-4">📊 Emotion Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            label={({ name }) => name}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
