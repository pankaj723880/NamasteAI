# TODO: Implement Weather Fetching in NamasteAI

## Current Status
- Frontend has a "Get Weather" button that calls `getWeather()` function.
- `getWeather()` fetches user location from ipapi.co but uses mock weather data due to invalid API key.
- Backend has `/api/chat/weather` endpoint that uses OpenWeatherMap API with `OPENWEATHER_API_KEY`.

## Tasks
- [ ] Update frontend `getWeather()` to call backend `/api/chat/weather` instead of mocking data.
- [ ] Ensure `OPENWEATHER_API_KEY` is set in server/.env (user needs to provide or set up).
- [ ] Test weather fetching functionality.
- [ ] Handle errors gracefully in frontend (e.g., if API fails, show message).

## Notes
- Backend requires lat/lon from query params.
- Frontend currently gets location from ipapi.co, which provides lat/lon.
- After updating, weather should fetch real data from OpenWeatherMap.
