export const timeAgo = (dateString: string | Date): string => {
  if (!dateString) return "agora";

  const safeDateString = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString;
  const date = new Date(safeDateString);

  if (isNaN(date.getTime()) || date.getFullYear() < 1980) return "agora";

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `há ${seconds}s`;
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  return `há ${Math.floor(seconds / 86400)}d`;
};
