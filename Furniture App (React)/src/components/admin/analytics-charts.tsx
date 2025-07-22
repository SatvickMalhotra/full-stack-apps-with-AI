// src/components/admin/analytics-charts.tsx (Corrected)
"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LegendProps } from 'recharts';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsChartsProps {
  dateWiseSummary: Record<string, number>;
  clinicCodeWiseSummary: Record<string, number>;
  partnerWiseSummary: Record<string, number>;
  itemWiseSummary: Record<string, number>;
  userWiseSummary: Record<string, number>;
}

const COLORS = ['#3b82f6', '#16a34a', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#facc15', '#14b8a6', '#6b7280'];
const MAX_PIE_SLICES = 6;

// --- FIX START ---
// The type for the 'children' prop has been corrected to React.ReactElement.
const ChartCard = ({ title, children }: { title: string; children: React.ReactElement }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl font-semibold text-center">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={350}>
        {children}
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
// --- FIX END ---

const processPieData = (data: Record<string, number>, t: (key: string) => string) => {
  const sortedData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (sortedData.length <= MAX_PIE_SLICES) {
    return sortedData;
  }

  const topSlices = sortedData.slice(0, MAX_PIE_SLICES - 1);
  const otherSliceValue = sortedData.slice(MAX_PIE_SLICES - 1).reduce((acc, curr) => acc + curr.value, 0);

  return [
    ...topSlices,
    { name: t('other'), value: otherSliceValue },
  ];
};

const renderColorfulLegendText = (value: string, entry: any) => {
  const { color } = entry;
  return <span style={{ color }}>{value}</span>;
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ dateWiseSummary, clinicCodeWiseSummary, partnerWiseSummary, itemWiseSummary, userWiseSummary }) => {
  const { t } = useLanguage();

  const chartData = (summary: Record<string, number>) =>
    Object.entries(summary).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const formatYAxisTick = (value: string) => {
    if (value.length > 15) {
      return `${value.substring(0, 15)}...`;
    }
    return value;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="md:col-span-2">
        <ChartCard title={t('dateWiseSummary')}>
          <BarChart data={chartData(dateWiseSummary)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toFixed(2)} />
            <Legend />
            <Bar dataKey="value" fill={COLORS[0]} name={t('totalAmount')} />
          </BarChart>
        </ChartCard>
      </div>
      <div className="md:col-span-2">
        <ChartCard title={t('partnerWiseSummary')}>
          <BarChart data={chartData(partnerWiseSummary)} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} tickFormatter={formatYAxisTick} interval={0} />
            <Tooltip formatter={(value: number) => value.toFixed(2)} />
            <Legend />
            <Bar dataKey="value" fill={COLORS[1]} name={t('totalAmount')} />
          </BarChart>
        </ChartCard>
      </div>
      <ChartCard title={t('clinicCodeWiseSummary')}>
        <PieChart>
          <Pie
            data={processPieData(clinicCodeWiseSummary, t)}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {processPieData(clinicCodeWiseSummary, t).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toFixed(2)} />
          <Legend layout="vertical" align="right" verticalAlign="middle" formatter={renderColorfulLegendText} />
        </PieChart>
      </ChartCard>
      <ChartCard title={t('itemWiseSummary')}>
        <PieChart>
          <Pie
            data={processPieData(itemWiseSummary, t)}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#82ca9d"
            dataKey="value"
            nameKey="name"
          >
            {processPieData(itemWiseSummary, t).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toFixed(2)} />
          <Legend layout="vertical" align="right" verticalAlign="middle" formatter={renderColorfulLegendText} />
        </PieChart>
      </ChartCard>
      <div className="md:col-span-2">
        <ChartCard title={t('userWiseSummary')}>
          <BarChart data={chartData(userWiseSummary)} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} interval={0} />
            <Tooltip formatter={(value: number) => value.toFixed(2)} />
            <Legend />
            <Bar dataKey="value" fill={COLORS[2]} name={t('totalAmount')} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
};