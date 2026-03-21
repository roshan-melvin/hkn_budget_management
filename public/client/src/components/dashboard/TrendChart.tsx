import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useExpenses } from '../../hooks/useExpenses';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const TrendChart: React.FC = () => {
    const { expenses } = useExpenses();

    const data = React.useMemo(() => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(new Date(), 5 - i);
            return {
                name: format(date, 'MMM'),
                monthStart: startOfMonth(date).getTime() / 1000,
                monthEnd: endOfMonth(date).getTime() / 1000,
                amount: 0,
            };
        });

        expenses.forEach((expense) => {
            const monthData = last6Months.find(
                (m) => expense.date >= m.monthStart && expense.date <= m.monthEnd
            );
            if (monthData) {
                monthData.amount += expense.cost;
            }
        });

        return last6Months;
    }, [expenses]);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        tickFormatter={(value: number) => `$${value}`}
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
