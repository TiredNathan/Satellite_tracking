
export const formatDateTime = (date: Date): string => {
    return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'long',
    });
};

export const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
};

export const formatCoordinate = (value: number, type: 'lat' | 'lng'): string => {
    const direction = type === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(3)}° ${direction}`;
};
