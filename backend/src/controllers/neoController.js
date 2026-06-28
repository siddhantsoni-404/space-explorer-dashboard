const nasaApi = require('../config/nasa');

exports.getNeo = async (req, res, next) => {
  try {
    const { start_date, end_date, minDiameter } = req.query;

    if (start_date || end_date) {
      if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'Both start_date and end_date are required if one is provided.', data: null });
      }

      const start = new Date(start_date);
      const end = new Date(end_date);
      const today = new Date();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid dates.', data: null });
      }

      if (start > today || end > today) {
        return res.status(400).json({ success: false, message: 'Dates cannot be in the future.', data: null });
      }

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 7) {
        return res.status(400).json({ success: false, message: 'Date range cannot exceed 7 days.', data: null });
      }
    }

    const params = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const response = await nasaApi.get('/neo/rest/v1/feed', { params });

    let asteroids = [];
    if (response.data && response.data.near_earth_objects) {
      const neos = response.data.near_earth_objects;
      for (const date in neos) {
        asteroids = asteroids.concat(neos[date]);
      }
    }

    if (minDiameter) {
      const minD = parseFloat(minDiameter);
      asteroids = asteroids.filter(a => {
        const estDiameter = a.estimated_diameter?.meters?.estimated_diameter_min || 0;
        return estDiameter >= minD;
      });
    }

    res.status(200).json({
      success: true,
      message: 'NEO fetched successfully',
      data: asteroids
    });
  } catch (error) {
    next(error);
  }
};
