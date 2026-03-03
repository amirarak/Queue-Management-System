
function getDayBounds(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  const start = new Date(y, m, d, 0, 0, 0, 0);
  const end   = new Date(y, m, d, 23, 59, 59, 999);

  return { start, end };
}


function getSecondsDiff(start, end) {
  if (!start || !end) return null;
  const diff = Math.round((new Date(end) - new Date(start)) / 1000);
  return diff >= 0 ? diff : null;
}


function formatSeconds(secs) {
  if (!secs || secs <= 0) return '0s';
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${mins}m ${s}s` : `${mins}m`;
}


function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


function getPaginationParams(query = {}) {
  const page   = Math.max(1, parseInt(query.page)  || 1);
  const limit  = Math.min(100, parseInt(query.limit) || 20);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function paginatedResponse(rows, page, limit, count) {
  return {
    success: true,
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit)
    }
  };
}

module.exports = {
  getDayBounds,
  getSecondsDiff,
  formatSeconds,
  generateRandomString,
  getPaginationParams,
  paginatedResponse
};