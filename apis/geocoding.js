const axios = require(`axios`);

module.exports = async (query) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: query, format: `json` },
    });

    if (response.data.length < 1) return null;
    const result = response.data[0];

    return {
      display_name: result.display_name,
      lat: result.lat,
      lon: result.lon,
    };
  } catch (error) {
    return undefined;
  }
};
