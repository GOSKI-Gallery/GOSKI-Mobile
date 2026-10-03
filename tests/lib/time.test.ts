import { timeAgo } from '../../lib/time';

describe('timeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-05T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "agora mesmo" for null', () => {
    expect(timeAgo(null as any)).toBe('agora mesmo');
  });

  it('returns "agora mesmo" for undefined', () => {
    expect(timeAgo(undefined as any)).toBe('agora mesmo');
  });

  it('returns "agora mesmo" for invalid date string', () => {
    expect(timeAgo('not-a-date')).toBe('agora mesmo');
  });

  it('returns "agora mesmo" for very recent (less than 30 seconds)', () => {
    const date = new Date('2026-06-05T11:59:45Z').toISOString();
    expect(timeAgo(date)).toBe('agora mesmo');
  });

  it('returns "há 1 minuto" at 30 seconds', () => {
    const date = new Date('2026-06-05T11:59:30Z').toISOString();
    expect(timeAgo(date)).toBe('há 1 minuto');
  });

  it('returns "há 1 minuto" at 59 seconds', () => {
    const date = new Date('2026-06-05T11:59:01Z').toISOString();
    expect(timeAgo(date)).toBe('há 1 minuto');
  });

  it('returns minutes for under an hour', () => {
    const date = new Date('2026-06-05T11:58:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 2 minutos');

    const date30 = new Date('2026-06-05T11:30:00Z').toISOString();
    expect(timeAgo(date30)).toBe('há 30 minutos');

    const date59 = new Date('2026-06-05T11:01:00Z').toISOString();
    expect(timeAgo(date59)).toBe('há 59 minutos');
  });

  it('returns "há 1 hora" at 60 minutes', () => {
    const date = new Date('2026-06-05T11:00:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 1 hora');
  });

  it('returns hours for under 24 hours', () => {
    const date2 = new Date('2026-06-05T10:00:00Z').toISOString();
    expect(timeAgo(date2)).toBe('há 2 horas');

    const date23 = new Date('2026-06-04T13:00:00Z').toISOString();
    expect(timeAgo(date23)).toBe('há 23 horas');
  });

  it('returns "há 1 dia" at 24 hours', () => {
    const date = new Date('2026-06-04T12:00:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 1 dia');
  });

  it('returns days for under 7 days', () => {
    const date3 = new Date('2026-06-02T12:00:00Z').toISOString();
    expect(timeAgo(date3)).toBe('há 3 dias');

    const date6 = new Date('2026-05-30T12:00:00Z').toISOString();
    expect(timeAgo(date6)).toBe('há 6 dias');
  });

  it('returns "há 1 semana" at 7 days', () => {
    const date = new Date('2026-05-29T12:00:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 1 semana');
  });

  it('returns weeks for under 4 weeks', () => {
    const date2 = new Date('2026-05-22T12:00:00Z').toISOString();
    expect(timeAgo(date2)).toBe('há 2 semanas');

    const date3 = new Date('2026-05-15T12:00:00Z').toISOString();
    expect(timeAgo(date3)).toBe('há 3 semanas');
  });

  it('returns "há 1 mês" at ~30 days', () => {
    const date = new Date('2026-05-05T12:00:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 1 mês');
  });

  it('returns months for under 12 months', () => {
    const date3 = new Date('2026-03-05T12:00:00Z').toISOString();
    expect(timeAgo(date3)).toBe('há 3 meses');

    const date11 = new Date('2025-07-05T12:00:00Z').toISOString();
    expect(timeAgo(date11)).toBe('há 11 meses');
  });

  it('returns "há 1 ano" at 12 months', () => {
    const date = new Date('2025-06-05T12:00:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 1 ano');
  });

  it('returns years for 12+ months', () => {
    const date2 = new Date('2024-06-05T12:00:00Z').toISOString();
    expect(timeAgo(date2)).toBe('há 2 anos');

    const date5 = new Date('2021-06-05T12:00:00Z').toISOString();
    expect(timeAgo(date5)).toBe('há 5 anos');
  });

  it('handles future dates gracefully', () => {
    const future = new Date('2026-06-05T13:00:00Z').toISOString();
    expect(timeAgo(future)).toBe('agora mesmo');
  });

  it('handles Supabase timestamp without timezone', () => {
    const date = '2026-06-05 11:59:30';
    expect(timeAgo(date)).toBe('há 1 minuto');
  });

  it('handles Date object', () => {
    const date = new Date('2026-06-05T11:59:30Z');
    expect(timeAgo(date)).toBe('há 1 minuto');
  });

  it('handles year before 1980', () => {
    const date = '1970-01-01T00:00:00Z';
    expect(timeAgo(date)).toBe('agora mesmo');
  });
});