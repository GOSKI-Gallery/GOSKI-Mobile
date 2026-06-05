import { timeAgo } from '../../lib/time';

describe('timeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-05T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "agora" for null', () => {
    expect(timeAgo(null as any)).toBe('agora');
  });

  it('returns "agora" for undefined', () => {
    expect(timeAgo(undefined as any)).toBe('agora');
  });

  it('returns "agora" for invalid date string', () => {
    expect(timeAgo('not-a-date')).toBe('agora');
  });

  it('returns seconds for less than 60s', () => {
    const date = new Date('2026-06-05T11:59:30Z').toISOString();
    expect(timeAgo(date)).toBe('há 30s');
  });

  it('returns minutes for less than 3600s', () => {
    const date = new Date('2026-06-05T11:58:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 2m');
  });

  it('returns hours for less than 86400s', () => {
    const date = new Date('2026-06-05T10:00:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 2h');
  });

  it('returns days for 86400s or more', () => {
    const date = new Date('2026-06-03T12:00:00Z').toISOString();
    expect(timeAgo(date)).toBe('há 2d');
  });

  it('handles Supabase timestamp without timezone', () => {
    const date = '2026-06-05 11:59:30';
    expect(timeAgo(date)).toBe('há 30s');
  });

  it('handles Date object', () => {
    const date = new Date('2026-06-05T11:59:30Z');
    expect(timeAgo(date)).toBe('há 30s');
  });
});
