export const timeAgo = (dateString: string | Date): string => {
  if (!dateString) return "agora";

  const safeDateString = typeof dateString === 'string' ? dateString.replace(' ', 'T') + 'Z' : dateString;
  const date = new Date(safeDateString);

  if (isNaN(date.getTime()) || date.getFullYear() < 1980) return "agora";

  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const seconds = Math.floor(diff / 1000);

  if (seconds === 0) return "agora";
  if (seconds < 60) return `há ${seconds}s`;
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  return `há ${Math.floor(seconds / 86400)}d`;
};
