export const getLogoUrl = (originalUrl: string, size: '30' | '60' = '60'): string => {
    if (!originalUrl) return '';
    if (size === '30') {
        return originalUrl.replace('/logos_60px60px/', '/logos_30px30px/');
    }
    return originalUrl;
};
