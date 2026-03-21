import React, { useState } from 'react';
import { FileText, Table } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useExpenses } from '../hooks/useExpenses';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { format } from 'date-fns';

const Reports: React.FC = () => {
    const { budgets } = useBudgets();
    const { expenses } = useExpenses();
    const [reportType, setReportType] = useState('full_summary');
    const [selectedBudget, setSelectedBudget] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const getFilteredExpenses = () => {
        let filtered = [...expenses];

        if (selectedBudget !== 'all') {
            filtered = filtered.filter(e => e.budgetId === selectedBudget);
        }

        if (dateFrom) {
            const fromTime = new Date(dateFrom).getTime() / 1000;
            filtered = filtered.filter(e => e.date >= fromTime);
        }

        if (dateTo) {
            const toTime = new Date(dateTo).getTime() / 1000;
            filtered = filtered.filter(e => e.date <= toTime);
        }

        return filtered;
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const filteredExpenses = getFilteredExpenses();

        doc.setFontSize(20);
        doc.text('IEEE Budget Report', 20, 20);

        doc.setFontSize(12);
        doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 20, 30);
        doc.text(`Report Type: ${reportType.replace('_', ' ').toUpperCase()}`, 20, 36);

        let yPos = 50;

        // Summary
        const totalSpent = filteredExpenses.reduce((acc, curr) => acc + curr.cost, 0);
        doc.text(`Total Expenses: $${totalSpent.toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Transaction Count: ${filteredExpenses.length}`, 20, yPos);
        yPos += 20;

        // Table Header
        doc.setFillColor(37, 99, 235); // Blue
        doc.setTextColor(255, 255, 255);
        doc.rect(20, yPos, 170, 10, 'F');
        doc.text('Date', 22, yPos + 7);
        doc.text('Item', 50, yPos + 7);
        doc.text('Category', 100, yPos + 7);
        doc.text('Amount', 160, yPos + 7);

        yPos += 10;
        doc.setTextColor(0, 0, 0);

        // Table Rows
        filteredExpenses.forEach((expense) => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }

            doc.text(format(new Date(expense.date * 1000), 'MM/dd/yy'), 22, yPos + 7);
            const item = doc.splitTextToSize(expense.item, 45);
            doc.text(item, 50, yPos + 7);
            doc.text(expense.category, 100, yPos + 7);
            doc.text(`$${expense.cost.toLocaleString()}`, 160, yPos + 7);

            yPos += 10 * Math.max(1, item.length);
        });

        doc.save('ieee-budget-report.pdf');
    };

    const generateCSV = () => {
        const filteredExpenses = getFilteredExpenses();
        const csvData = filteredExpenses.map(e => ({
            Date: format(new Date(e.date * 1000), 'yyyy-MM-dd'),
            Item: e.item,
            Category: e.category,
            Cost: e.cost,
            'Funded By': e.fundedBy,
            Status: e.status,
            Comments: e.comments || ''
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ieee-budget-report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredExpenses = getFilteredExpenses();
    const totalSpent = filteredExpenses.reduce((acc, curr) => acc + curr.cost, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-heading font-bold text-text-primary">Reports</h1>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Select
                        label="Report Type"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        options={[
                            { value: 'full_summary', label: 'Full Budget Summary' },
                            { value: 'expense_report', label: 'Expense Report' },
                            { value: 'income_report', label: 'Income Report' },
                        ]}
                    />

                    <Select
                        label="Budget"
                        value={selectedBudget}
                        onChange={(e) => setSelectedBudget(e.target.value)}
                        options={[
                            { value: 'all', label: 'All Budgets' },
                            ...budgets.map(b => ({ value: b.id, label: b.name }))
                        ]}
                    />

                    <Input
                        label="From Date"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />

                    <Input
                        label="To Date"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

                <div className="flex justify-end space-x-4 border-t border-border pt-6">
                    <Button variant="outline" icon={FileText} onClick={generatePDF}>
                        Export PDF
                    </Button>
                    <Button variant="outline" icon={Table} onClick={generateCSV}>
                        Export CSV
                    </Button>
                </div>
            </Card>

            <Card title="Report Preview">
                <div className="mb-6 p-4 bg-bg-secondary rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-sm text-text-secondary">Total Expenses Found</p>
                        <p className="text-2xl font-bold text-text-primary">{filteredExpenses.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-secondary">Total Amount</p>
                        <p className="text-2xl font-bold text-primary-blue">${totalSpent.toLocaleString()}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-secondary border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
                                <th className="px-4 py-3 font-medium text-text-secondary">Item</th>
                                <th className="px-4 py-3 font-medium text-text-secondary">Category</th>
                                <th className="px-4 py-3 font-medium text-text-secondary">Amount</th>
                                <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredExpenses.slice(0, 10).map((expense) => (
                                <tr key={expense.id}>
                                    <td className="px-4 py-3 text-text-primary">{format(new Date(expense.date * 1000), 'MMM d, yyyy')}</td>
                                    <td className="px-4 py-3 text-text-primary">{expense.item}</td>
                                    <td className="px-4 py-3 text-text-secondary">{expense.category}</td>
                                    <td className="px-4 py-3 font-medium text-text-primary">${expense.cost.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-text-secondary capitalize">{expense.status.replace('_', ' ')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredExpenses.length > 10 && (
                        <div className="p-4 text-center text-sm text-text-muted border-t border-border">
                            Showing first 10 of {filteredExpenses.length} records. Export to see full data.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Reports;
