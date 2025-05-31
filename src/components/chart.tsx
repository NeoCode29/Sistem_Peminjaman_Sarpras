'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'jan', value: 5 },
  { month: 'feb', value: 14 },
  { month: 'mar', value: 10 },
  { month: 'apr', value: 16 },
  { month: 'mei', value: 12 },
  { month: 'jun', value: 21 },
  { month: 'jul', value: 34 },
  { month: 'agu', value: 54 },
  { month: 'sep', value: 13 },
  { month: 'okt', value: 42 },
  { month: 'nov', value: 12 },
  { month: 'des', value: 11 },
];

export default function Chart() {
  return (
    <div className="w-[642px] h-[282px] bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Grafik peminjaman per bulan</h2>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#000"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
