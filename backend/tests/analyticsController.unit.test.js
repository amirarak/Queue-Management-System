jest.mock('../src/models', () => ({
  Ticket: { findAll: jest.fn() },
  User: {}
}));

const { Ticket } = require('../src/models');
const analyticsController = require('../src/controllers/analyticsController');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('analytics controller unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getPeriodStats returns 400 when dates are missing', async () => {
    const req = { query: {} };
    const res = createRes();
    const next = jest.fn();

    await analyticsController.getPeriodStats(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test('getPeriodStats returns 400 when startDate is after endDate', async () => {
    const req = { query: { startDate: '2026-02-01', endDate: '2026-01-01' } };
    const res = createRes();
    const next = jest.fn();

    await analyticsController.getPeriodStats(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'startDate must be before or equal to endDate' })
    );
  });

  test('getTodayStats returns aggregated data', async () => {
    Ticket.findAll.mockResolvedValue([
      {
        status: 'completed',
        createdAt: '2026-01-01T09:00:00.000Z',
        calledAt: '2026-01-01T09:02:00.000Z',
        completedAt: '2026-01-01T09:05:00.000Z',
        purposeKey: 'services.reference',
        server: { id: 11, fullName: 'Staff One' }
      },
      {
        status: 'waiting',
        createdAt: '2026-01-01T10:00:00.000Z',
        purposeKey: 'services.document'
      }
    ]);

    const req = {};
    const res = createRes();
    const next = jest.fn();

    await analyticsController.getTodayStats(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          overview: expect.objectContaining({ total: 2, completed: 1, waiting: 1 }),
          topServices: expect.any(Array)
        })
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('exportReport validates date format', async () => {
    const req = { query: { startDate: 'bad-date', endDate: '2026-01-10' } };
    const res = createRes();
    const next = jest.fn();

    await analyticsController.exportReport(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid date format' }));
    expect(next).not.toHaveBeenCalled();
  });

  test('exportReport maps ticket fields in response payload', async () => {
    Ticket.findAll.mockResolvedValue([
      {
        ticketCode: 'ENG-1',
        studentName: 'Test Student',
        purposeKey: 'services.reference',
        status: 'completed',
        createdAt: '2026-01-01T08:00:00.000Z',
        calledAt: '2026-01-01T08:02:00.000Z',
        completedAt: '2026-01-01T08:05:00.000Z',
        server: { fullName: 'Staff A' }
      }
    ]);

    const req = { query: { startDate: '2026-01-01', endDate: '2026-01-01' } };
    const res = createRes();
    const next = jest.fn();

    await analyticsController.exportReport(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [
          expect.objectContaining({
            ticketCode: 'ENG-1',
            servedBy: 'Staff A'
          })
        ],
        meta: expect.objectContaining({ count: 1 })
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('saveDailyAnalytics returns static success payload', async () => {
    const req = {};
    const res = createRes();

    await analyticsController.saveDailyAnalytics(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Analytics computed on the fly'
    });
  });

  test('getTodayStats forwards errors to next', async () => {
    const dbError = new Error('db fail');
    Ticket.findAll.mockRejectedValue(dbError);

    const req = {};
    const res = createRes();
    const next = jest.fn();

    await analyticsController.getTodayStats(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
