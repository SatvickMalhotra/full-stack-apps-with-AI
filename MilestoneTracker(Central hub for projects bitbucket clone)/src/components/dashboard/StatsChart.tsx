import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import type { Project } from '../../types';

interface StatsChartProps {
    projects: Project[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ projects }) => {


    const data = [
        { name: 'Ongoing', value: projects.filter(p => p.status === 'ongoing').length, color: 'var(--status-ongoing)' },
        { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'var(--status-completed)' },
        { name: 'Future', value: projects.filter(p => p.status === 'future').length, color: 'var(--status-future)' },
    ].filter(d => d.value > 0);

    return (
        <div className="card p-6 h-[300px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Project Status</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)'
                            }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
