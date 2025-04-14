const axios = require('axios');

/**
 * Récupère les jours fériés à partir de l'API Calendarific
 * @param {number} year - année actuelle
 * @returns {Promise<Array>} - liste formatée des jours fériés
 */
const holidayapi = async (year) => {
  const apiKey = process.env.CALENDARIFIC_API_KEY;
  const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=TN&year=${year}`;

  const response = await axios.get(url);
  const holidays = response.data.response.holidays;

  return holidays.map((holiday) => {
    const title = holiday.name || "Jour férié inconnu";
    const description = holiday.description || title;

    let type = "autre";
    if (holiday.type.includes("National holiday")) {
      type = "national";
    } else if (holiday.type.includes("religious")) {
      type = "religieux";
    }

    return {
      titre: title,
      description,
      date: new Date(holiday.date.iso),
      type
    };
  });
};

module.exports = {
    holidayapi
};


