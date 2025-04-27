export const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const isEqualValues = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
