const nasaApi = require('../config/nasa');

exports.getMarsPhotos = async (req, res, next) => {
  try {
    const { rover = 'curiosity', sol, earth_date, camera, page = 1 } = req.query;

    const validRovers = ['curiosity', 'opportunity', 'spirit'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid rover name.', data: null });
    }

    if (earth_date) {
      const queryDate = new Date(earth_date);
      const today = new Date();
      if (isNaN(queryDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid earth_date.', data: null });
      }
      if (queryDate > today) {
        return res.status(400).json({ success: false, message: 'Date cannot be in the future.', data: null });
      }
    }

    const params = { page };
    if (sol) params.sol = sol;
    if (earth_date) params.earth_date = earth_date;
    if (camera) params.camera = camera;
    
    // If neither sol nor earth_date is provided, default to sol 1000 to get some data
    if (!sol && !earth_date) {
      params.sol = 1000;
    }

    const response = await nasaApi.get(`/mars-photos/api/v1/rovers/${rover}/photos`, { params });

    if (!response.data.photos || response.data.photos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No photos found.',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mars photos fetched successfully',
      data: response.data.photos
    });
  } catch (error) {
    next(error);
  }
};
