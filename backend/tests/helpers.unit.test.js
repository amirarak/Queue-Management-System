const {
  getDayBounds,
  getSecondsDiff,
  formatSeconds,
  generateRandomString,
  getPaginationParams,
  paginatedResponse
} = require('../src/utils/helpers');

describe('helpers utility unit tests', () => {
  test('getDayBounds returns start/end of local day', () => {
    const { start, end } = getDayBounds(new Date('2026-03-15T12:34:56.789Z'));

    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);

    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });

  test('getSecondsDiff returns rounded positive seconds and null on invalid order', () => {
    expect(getSecondsDiff('2026-01-01T00:00:00.000Z', '2026-01-01T00:00:01.600Z')).toBe(2);
    expect(getSecondsDiff('2026-01-01T00:00:02.000Z', '2026-01-01T00:00:01.000Z')).toBeNull();
    expect(getSecondsDiff(null, new Date())).toBeNull();
  });

  test('formatSeconds formats values as expected', () => {
    expect(formatSeconds(0)).toBe('0s');
    expect(formatSeconds(45)).toBe('45s');
    expect(formatSeconds(60)).toBe('1m');
    expect(formatSeconds(125)).toBe('2m 5s');
  });

  test('generateRandomString uses requested length and only alphanumeric chars', () => {
    const value = generateRandomString(40);

    expect(value).toHaveLength(40);
    expect(/^[A-Za-z0-9]+$/.test(value)).toBe(true);
  });

  test('getPaginationParams enforces min page and max limit', () => {
    expect(getPaginationParams({ page: '-2', limit: '300' })).toEqual({ page: 1, limit: 100, offset: 0 });
    expect(getPaginationParams({ page: '3', limit: '25' })).toEqual({ page: 3, limit: 25, offset: 50 });
    expect(getPaginationParams({})).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  test('paginatedResponse wraps rows with pagination metadata', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const result = paginatedResponse(rows, 2, 10, 25);

    expect(result).toEqual({
      success: true,
      data: rows,
      pagination: {
        total: 25,
        page: 2,
        limit: 10,
        pages: 3
      }
    });
  });
});
