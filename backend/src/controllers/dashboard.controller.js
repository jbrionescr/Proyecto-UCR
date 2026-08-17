const DashboardService = require('../services/dashboard.service');

class DashboardController {
  async getMetrics(req, res) {
    try {
      const metrics = await DashboardService.getMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      console.error('Error in DashboardController:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
  }
}

module.exports = new DashboardController();
