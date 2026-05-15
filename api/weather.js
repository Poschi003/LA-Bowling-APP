const { handleError, sendJson } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", "48.5442");
    url.searchParams.set("longitude", "12.1467");
    url.searchParams.set("current", "temperature_2m,precipitation,weather_code,wind_speed_10m");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
    url.searchParams.set("timezone", "Europe/Berlin");
    url.searchParams.set("forecast_days", "1");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Wetterbericht konnte nicht geladen werden.");
    const data = await response.json();
    sendJson(res, 200, {
      location: "Roentgenstrasse 12, 84034 Landshut",
      current: data.current,
      daily: {
        weatherCode: data.daily?.weather_code?.[0],
        tempMax: data.daily?.temperature_2m_max?.[0],
        tempMin: data.daily?.temperature_2m_min?.[0],
        precipitation: data.daily?.precipitation_sum?.[0]
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

