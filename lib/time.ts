export const timeAgo = (dateString: string | Date): string => {
  if (!dateString) {
    return "agora";
  }
  const safeDateString = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString;
  const date = new Date(safeDateString);

  if (isNaN(date.getTime()) || date.getFullYear() < 1980) {
    return "agora";
  }

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) {
    return "agora";
  }

  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  if (seconds < 60) {
    return rtf.format(-seconds, 'second').replace("segundos", "seg");
  }
  if (seconds < 3600) {
    return rtf.format(-Math.floor(seconds / 60), 'minute').replace("minutos", "min");
  }
  if (seconds < 86400) {
    return rtf.format(-Math.floor(seconds / 3600), 'hour').replace("horas", "h");
  }
  if (seconds < 86400 * 7) {
      const days = Math.floor(seconds / 86400);
      return rtf.format(-days, 'day').replace("dias", "d");
  }

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
