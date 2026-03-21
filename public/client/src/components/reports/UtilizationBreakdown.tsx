import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

interface UtilizationItem {
    category: string;
    amount: number;
    description: string;
}

interface UtilizationBreakdownProps {
    items: Record<string, { amount: number; description: string }>;
    onChange: (items: Record<string, { amount: number; description: string }>) => void;
    totalFunds?: number;
}

const UtilizationBreakdown: React.FC<UtilizationBreakdownProps> = ({
    items,
    onChange,
    totalFunds
}) => {
    const itemsArray = Object.entries(items).map(([category, data]) => ({
        category,
        ...data
    }));

    const addItem = () => {
        const newItems = { ...items };
        const newKey = `category_${Date.now()}`;
        newItems[newKey] = { amount: 0, description: '' };
        onChange(newItems);
    };

    const removeItem = (category: string) => {
        const newItems = { ...items };
        delete newItems[category];
        onChange(newItems);
    };

    const updateItem = (oldCategory: string, field: 'category' | 'amount' | 'description', value: any) => {
        const newItems = { ...items };

        if (field === 'category') {
            // Rename category
            const data = newItems[oldCategory];
            delete newItems[oldCategory];
            newItems[value] = data;
        } else {
            newItems[oldCategory] = {
                ...newItems[oldCategory],
                [field]: field === 'amount' ? parseFloat(value) || 0 : value
            };
        }

        onChange(newItems);
    };

    const totalUtilized = itemsArray.reduce((sum, item) => sum + (item.amount || 0), 0);
    const remaining = totalFunds ? totalFunds - totalUtilized : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-primary">
                    Fund Utilization Breakdown
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Category
                </Button>
            </div>

            {itemsArray.length === 0 ? (
                <div className="text-center py-8 bg-bg-secondary rounded-lg border border-border">
                    <p className="text-text-muted text-sm">
                        No expense categories added yet
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addItem}
                        className="mt-3"
                    >
                        Add First Category
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {itemsArray.map((item, index) => (
                        <div
                            key={item.category}
                            className="p-4 bg-bg-secondary rounded-lg border border-border"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Input
                                        label="Category *"
                                        value={item.category.startsWith('category_') ? '' : item.category}
                                        onChange={(e) => updateItem(item.category, 'category', e.target.value)}
                                        placeholder="e.g., Venue, Food, Materials"
                                        required
                                    />
                                    <Input
                                        label="Amount *"
                                        type="number"
                                        step="0.01"
                                        value={item.amount || ''}
                                        onChange={(e) => updateItem(item.category, 'amount', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    <Input
                                        label="Description"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.category, 'description', e.target.value)}
                                        placeholder="Brief description"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(item.category)}
                                    className="mt-6 p-2 text-text-secondary hover:text-red-600 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {itemsArray.length > 0 && (
                <div className="p-4 bg-bg-secondary rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Total Utilized:</span>
                        <span className="font-semibold text-text-primary">
                            ${totalUtilized.toLocaleString()}
                        </span>
                    </div>
                    {totalFunds !== undefined && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Total Funds Received:</span>
                                <span className="font-semibold text-text-primary">
                                    ${totalFunds.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-border">
                                <span className="text-text-secondary">Remaining:</span>
                                <span className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${remaining.toLocaleString()}
                                </span>
                            </div>
                            {remaining < 0 && (
                                <p className="text-xs text-red-600 mt-2">
                                    ⚠️ Total utilization exceeds funds received
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UtilizationBreakdown;
