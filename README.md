# WeatherBuddy

A sleek, compact weather application with a dark futuristic design that displays current weather conditions, forecast, and air quality information for any location worldwide.

## Features

- **Current Weather**: Shows temperature, weather description, feels like, humidity, and wind speed
- **5-Day Forecast**: Displays a 5-day weather forecast with icons and descriptions
- **Air Quality**: Shows Air Quality Index (AQI) and individual pollutant levels
- **Location Search**: Search for any city worldwide
- **Geolocation**: Get weather for your current location
- **Health Recommendations**: Suggestions based on the current air quality level
- **Compact UI**: Space-efficient design that works on all devices
- **Dark Mode**: Ultra-dark theme with glass morphism, subtle gradients, and futuristic accents

## How to Use

1. Clone or download this repository
2. Sign up for a free OpenWeatherMap API key at [https://openweathermap.org/api](https://openweathermap.org/api)
3. Open `js/app.js` and replace "YOUR_OPENWEATHERMAP_API_KEY" with your actual API key
4. Open `index.html` in your web browser

## Getting an OpenWeatherMap API Key

1f71f82b2b2691fbe49f5f27e62a09c4 API KEY 

1. Visit [OpenWeatherMap](https://openweathermap.org/) and create a free account
2. After logging in, go to your account dashboard and navigate to "API keys"
3. Generate a new API key (it may take a few hours to activate)
4. Copy this key and paste it in the `app.js` file

```javascript
const API_KEY = "your-api-key-here";
```

## API Endpoints Used

This app uses the following OpenWeatherMap APIs:

- Geocoding API: To convert city names to coordinates
- Current Weather API: For current weather conditions
- 5-Day Forecast API: For weather forecasts
- Air Pollution API: For air quality data

## Project Structure

- `index.html`: Main HTML file with the application structure
- `css/styles.css`: Styling for the application
- `js/app.js`: JavaScript code for fetching and displaying data
- `img/`: Folder for storing any images (currently empty, weather icons are loaded from OpenWeatherMap)

## Notes for Beginners

- This app uses vanilla JavaScript without any frameworks to keep it simple
- The API key should be kept private in a real production application
- The free tier of OpenWeatherMap has usage limits (1,000 API calls per day)
- Modern JavaScript features like async/await are used for API requests

## Future Improvements

Here are some features you could add as you learn more:

- Temperature unit toggle (Celsius/Fahrenheit)
- Historical weather data charts
- Weather maps visualization
- Weather alerts for severe conditions
- More detailed air quality information
- Saving favorite locations

## Resources for Learning

- [MDN Web Docs](https://developer.mozilla.org/): Great resource for learning HTML, CSS, and JavaScript
- [OpenWeatherMap API Docs](https://openweathermap.org/api): Documentation for the APIs used
- [W3Schools](https://www.w3schools.com/): Tutorials and references for web development
- [CSS-Tricks](https://css-tricks.com/): Articles and guides on CSS

## License

This project is open source and available for anyone to use and modify. 