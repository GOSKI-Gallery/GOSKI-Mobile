export const timeAgo = (dateString: string | Date): string => {
  if (!dateString) return "agora mesmo";

  const safeDateString = typeof dateString === 'string'
    ? dateString.replace(' ', 'T') + (/[Z]$/.test(dateString) || /[+-]\d{2}:\d{2}$/.test(dateString) ? '' : 'Z')
    : dateString;
  const date = new Date(safeDateString);

  if (isNaN(date.getTime()) || date.getFullYear() < 1980) return "agora mesmo";

  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const seconds = Math.floor(diff / 1000);

  if (seconds < 30) return "agora mesmo";
  if (seconds < 60) return "há 1 minuto";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "há 1 minuto" : `há ${minutes} minutos`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "há 1 hora" : `há ${hours} horas`;

  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "há 1 dia" : `há ${days} dias`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return weeks === 1 ? "há 1 semana" : `há ${weeks} semanas`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "há 1 mês" : `há ${months} meses`;

  const years = Math.floor(days / 365);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
};