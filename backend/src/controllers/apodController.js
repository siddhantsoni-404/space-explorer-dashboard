const nasaApi = require('../config/nasa');

exports.getApod = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (date) {
      // Validate date
      const queryDate = new Date(date);
      const today = new Date();
      if (isNaN(queryDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date.', data: null });
      }
      if (queryDate > today) {
        return res.status(400).json({ success: false, message: 'Date cannot be in the future.', data: null });
      }
    }

    const response = await nasaApi.get('/planetary/apod', {
      params: { date }
    });

    res.status(200).json({
      success: true,
      message: 'APOD fetched successfully',
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};
