export const formatStatus = (status: string): string => {
    if (!status) return '';
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status) {
        case 'approved':
        case 'completed':
            return 'success';
        case 'payment_processing':
            return 'info';
        case 'rejected':
            return 'danger';
        case 'pending_review':
        case 'draft':
            return 'warning';
        default:
            return 'default';
    }
};
