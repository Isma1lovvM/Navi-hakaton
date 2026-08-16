"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeeklyRevenuePoint } from "@/lib/actions/reports";

export function WeeklyRevenueChart({ data }: { data: WeeklyRevenuePoint[] }) {
  return (
    <div className="h-64 rounded-card border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString("uz-UZ")} so'm`, "Daromad"]}
            contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }}
          />
          <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
