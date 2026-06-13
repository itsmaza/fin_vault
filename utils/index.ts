function formatDateTime(date: Date | string) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return new Date(date).toLocaleString('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}
export { formatDateTime };
