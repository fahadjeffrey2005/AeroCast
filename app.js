// API key for OpenWeatherMap
// Note: In a production environment, you should never expose your API key in the frontend
// You would typically use a backend server to make these API requests
const API_KEY = "1f71f82b2b2691fbe49f5f27e62a09c4";

// DOM elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const errorContainer = document.getElementById("error-container");
const currentWeather = document.getElementById("current-weather");
const cityName = document.getElementById("city-name");
const dateTime = document.getElementById("date-time");
const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weather-icon");
const weatherDescription = document.getElementById("weather-description");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const forecastContainer = document.getElementById("forecast-container");
const aqiValue = document.getElementById("aqi-value");
const aqiStatus = document.getElementById("aqi-status");
const pm25 = document.getElementById("pm25");
const pm10 = document.getElementById("pm10");
const o3 = document.getElementById("o3");
const no2 = document.getElementById("no2");
const healthRecommendations = document.getElementById("health-recommendations");
const uvRecommendations = document.getElementById("uv-recommendations");
const weatherRecommendations = document.getElementById("weather-recommendations");
// New elements for the AQI in the current weather panel
const currentPm25 = document.getElementById("current-pm25");
const currentO3 = document.getElementById("current-o3");

// DOM Elements for new features
const uvValue = document.getElementById('uv-value');
const uvLabel = document.getElementById('uv-label');
const uvIndexDetail = document.getElementById('uv-index-detail');
const clothingRecommendation = document.getElementById('clothing-recommendation');
const clothingIcons = document.querySelectorAll('.clothing-icon');
const tempTrend = document.getElementById('temp-trend');
const aqiTrend = document.getElementById('aqi-trend');
const alertsBanner = document.getElementById('alerts-banner');
const alertMessage = document.getElementById('alert-message');
const profileStatusMessage = document.getElementById('profile-status-message');
const activeSensitivities = document.getElementById('active-sensitivities');

// Modal elements
const profileModal = document.getElementById('profile-modal');
const alertsModal = document.getElementById('alerts-modal');
const historyModal = document.getElementById('history-modal');
const alertsContainer = document.getElementById('alerts-container');
const setupProfileBtn = document.getElementById('setup-profile-btn');
const alertDetailsBtn = document.getElementById('alert-details-btn');
const historicalDataBtn = document.getElementById('historical-data-btn');
const healthProfileForm = document.getElementById('health-profile-form');
const closeBtns = document.querySelectorAll('.close-btn');
const tabBtns = document.querySelectorAll('.tab-btn');

// Global variables for user profiles and trends
let userHealthProfile = null;
let historicalData = null;
let weatherAlerts = [];

// Custom weather icon mapping to ensure better icons
const weatherIconMap = {
    '01d': 'clear-day.svg',
    '01n': 'clear-night.svg',
    '02d': 'partly-cloudy-day.svg',
    '02n': 'partly-cloudy-night.svg',
    '03d': 'cloudy.svg',
    '03n': 'cloudy.svg',
    '04d': 'cloudy.svg',
    '04n': 'cloudy.svg',
    '09d': 'rain.svg',
    '09n': 'rain.svg',
    '10d': 'rain.svg',
    '10n': 'rain.svg',
    '11d': 'thunderstorm.svg',
    '11n': 'thunderstorm.svg',
    '13d': 'snow.svg',
    '13n': 'snow.svg',
    '50d': 'fog.svg',
    '50n': 'fog.svg'
};

// Event listeners
searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError("Please enter a city name");
    }
});

searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            showError("Please enter a city name");
        }
    }
});

locationBtn.addEventListener("click", () => {
    console.log("Location button clicked"); // Debugging
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Position obtained:", position.coords); // Debugging
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherDataByCoords(lat, lon);
            },
            (error) => {
                console.error("Geolocation error:", error);
                hideLoading();
                showError("Unable to retrieve your location. Please ensure location access is enabled in your browser settings.");
            },
            { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showError("Geolocation is not supported by your browser");
    }
});

// Function to get weather data by city name
async function getWeatherData(city) {
    showLoading();
    try {
        // Get current weather
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!weatherResponse.ok) {
            throw new Error("City not found");
        }
        const weatherData = await weatherResponse.json();
        
        // Get coordinates for forecast and air quality
        const { lat, lon } = weatherData.coord;
        
        // Get forecast data
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();
        
        // Get air quality data
        const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const airQualityData = await airQualityResponse.json();
        
        // Display all data
        displayWeatherData(weatherData);
        displayForecastData(forecastData);
        displayAirQualityData(airQualityData);
        
        hideLoading();
        hideError();
    } catch (error) {
        hideLoading();
        showError(error.message === "City not found" ? "City not found. Please try another city name." : "Failed to fetch weather data. Please try again later.");
        console.error("Error fetching weather data:", error);
    }
}

// Function to get weather data by coordinates
async function getWeatherDataByCoords(lat, lon, locationName = null) {
    showLoading();
    try {
        console.log(`Fetching weather for coordinates: ${lat}, ${lon}`); // Debugging
        
        // Get current weather
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();
        
        // Get forecast data
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();
        
        // Get air quality data
        const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const airQualityData = await airQualityResponse.json();
        
        // Display all data
        displayWeatherData(weatherData, locationName);
        displayForecastData(forecastData);
        displayAirQualityData(airQualityData);
        
        hideLoading();
        hideError();
    } catch (error) {
        hideLoading();
        showError("Failed to fetch weather data. Please try again later.");
        console.error("Error fetching weather data by coordinates:", error);
    }
}

// Function to display current weather data
function displayWeatherData(data, customLocationName = null) {
    hideLoading();
    hideError();
    
    // Set city name
    const location = customLocationName || data.name + (data.sys.country ? `, ${data.sys.country}` : '');
    cityName.textContent = location;
    
    // Format and set date & time for the location's timezone
    const timezone = data.timezone; // Timezone offset in seconds
    const localTime = new Date(Date.now() + timezone * 1000);
    const options = { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    dateTime.textContent = localTime.toLocaleString('en-US', options);
    
    // Set temperature and weather description
    const temp = Math.round(data.main.temp);
    temperature.textContent = `${temp}°C`;
    applyTemperatureColor(temp, temperature);
    
    // Set weather description and icon
    const weatherDesc = data.weather[0].description;
    weatherDescription.textContent = weatherDesc;
    
    // Use OpenWeatherMap icons directly instead of local icons
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = weatherDesc;
    
    // Check if we should display moon or sun effects
    checkAndDisplayMoon(data);
    
    // Set other weather details
    const feelsLikeTemp = Math.round(data.main.feels_like);
    feelsLike.textContent = `${feelsLikeTemp}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    
    // Update UV index if available (will be fetched separately for OpenWeatherMap)
    fetchAndDisplayUVIndex(data.coord.lat, data.coord.lon);
    
    // Generate clothing recommendations based on weather conditions
    generateClothingRecommendations(data);
    
    // Update weather-specific health recommendations
    updateWeatherRecommendations(temp, weatherDesc, data.wind.speed, data.main.humidity);
    
    // Fetch and display historical data for trends
    fetchHistoricalData(location);
    
    // Check for weather alerts
    checkWeatherAlerts(data, location);
}

// Function to check if it's nighttime or daytime and display appropriate icon
function checkAndDisplayMoon(data) {
    // Get the current time at the location
    const timestamp = data.dt * 1000; // Convert UNIX timestamp to milliseconds
    const currentTime = new Date(timestamp);
    
    // Get sunrise and sunset times
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    const sunsetTime = new Date(data.sys.sunset * 1000);
    
    // Check if it's nighttime (before sunrise or after sunset)
    const isNighttime = currentTime < sunriseTime || currentTime > sunsetTime;
    
    // Get the weather info div for positioning
    const weatherInfoDiv = document.querySelector('.weather-info');
    
    // Handle moon element
    let moonElement = document.getElementById('night-moon');
    if (!moonElement) {
        moonElement = document.createElement('i');
        moonElement.id = 'night-moon';
        moonElement.className = 'fas fa-moon';
        weatherInfoDiv.appendChild(moonElement);
    }
    
    // Handle sun element
    let sunElement = document.getElementById('day-sun');
    if (!sunElement) {
        sunElement = document.createElement('i');
        sunElement.id = 'day-sun';
        sunElement.className = 'fas fa-sun';
        weatherInfoDiv.appendChild(sunElement);
    }
    
    // Show or hide the moon and sun based on time
    if (isNighttime) {
        moonElement.style.display = 'block';
        sunElement.style.display = 'none';
        console.log("Nighttime detected - showing moon");
    } else {
        moonElement.style.display = 'none';
        sunElement.style.display = 'block';
        console.log("Daytime detected - showing sun");
    }
}

// Function to display forecast data
function displayForecastData(data) {
    forecastContainer.innerHTML = "";

    // Process only the daily forecasts (every 24 hours)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 3);

    dailyForecasts.forEach((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const description = forecast.weather[0].description;
        const iconCode = forecast.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        // Check if the forecast is for nighttime (icon codes ending with 'n' indicate night)
        const isNight = iconCode.endsWith('n');
        
        // Create celestial icon HTML (moon for night, sun for day)
        let celestialIcon = '';
        if (isNight) {
            celestialIcon = '<i class="fas fa-moon forecast-moon"></i>';
        } else {
            celestialIcon = '<i class="fas fa-sun forecast-sun"></i>';
        }

        const forecastCard = document.createElement("div");
        forecastCard.className = `forecast-card forecast-day-${index}`;
        forecastCard.innerHTML = `
            <h3>${dayName}</h3>
            <div class="forecast-icon-container">
                <img src="${iconUrl}" alt="${description}">
                ${celestialIcon}
            </div>
            <p class="temp">${temp}°C</p>
            <p class="description">${description}</p>
        `;

        forecastContainer.appendChild(forecastCard);
        
        // Apply temperature color to the temperature element
        const tempElement = forecastCard.querySelector('.temp');
        applyTemperatureColor(temp, tempElement);
    });
}

// Function to display air quality data
function displayAirQualityData(data) {
    console.log("Air quality data:", data); // Debug to see what we're receiving

    // Get AQI value
    const aqi = data.list[0].main.aqi;
    console.log("AQI value:", aqi); // Debug the aqi value
    
    // First set the text content
    aqiValue.textContent = aqi;
    
    // Then directly apply the color class to the AQI value based on the AQI level
    let statusText;
    let statusClass;
    
    // Remove any existing AQI classes
    aqiValue.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy-sensitive', 'aqi-unhealthy', 'aqi-very-unhealthy', 'aqi-hazardous');
    
    // Apply appropriate class based on OpenWeatherMap's AQI scale (1-5)
    switch(aqi) {
        case 1:
            aqiValue.classList.add('aqi-good');
            statusText = 'Good';
            statusClass = 'aqi-good';
            break;
        case 2:
            aqiValue.classList.add('aqi-moderate');
            statusText = 'Moderate';
            statusClass = 'aqi-moderate';
            break;
        case 3:
            aqiValue.classList.add('aqi-unhealthy-sensitive');
            statusText = 'Unhealthy for Sensitive Groups';
            statusClass = 'aqi-unhealthy-sensitive';
            break;
        case 4:
            aqiValue.classList.add('aqi-unhealthy');
            statusText = 'Unhealthy';
            statusClass = 'aqi-unhealthy';
            break;
        case 5:
            aqiValue.classList.add('aqi-very-unhealthy');
            statusText = 'Very Unhealthy';
            statusClass = 'aqi-very-unhealthy';
            break;
        default:
            aqiValue.classList.add('aqi-hazardous');
            statusText = 'Hazardous';
            statusClass = 'aqi-hazardous';
    }
    
    // Set the status text
    aqiStatus.textContent = statusText;
    
    // Apply color class to status text for consistency
    aqiStatus.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy-sensitive', 'aqi-unhealthy', 'aqi-very-unhealthy', 'aqi-hazardous');
    aqiStatus.classList.add(statusClass);
    
    // Update current pollutant values
    if (data.list[0].components) {
        const components = data.list[0].components;
        
        // Update mini-pollutant values in the AQI info section
        currentPm25.textContent = `${Math.round(components.pm2_5)} μg/m³`;
        currentO3.textContent = `${Math.round(components.o3)} μg/m³`;
        
        // Update detailed pollutant values in the air quality details section
        pm25.textContent = `${Math.round(components.pm2_5)} μg/m³`;
        pm10.textContent = `${Math.round(components.pm10)} μg/m³`;
        o3.textContent = `${Math.round(components.o3)} μg/m³`;
        no2.textContent = `${Math.round(components.no2)} μg/m³`;
    }
    
    // Update health recommendations - now handles asynchronously internally
    updateHealthRecommendations(aqi);
}

// Loading state functions
function showLoading() {
    cityName.textContent = "Loading...";
    weatherDescription.textContent = "Fetching data...";
    temperature.textContent = "--°C";
    feelsLike.textContent = "--°C";
    humidity.textContent = "--%";
    windSpeed.textContent = "-- km/h";
    aqiValue.textContent = "--";
    aqiStatus.textContent = "--";
    currentPm25.textContent = "--";
    currentO3.textContent = "--";
}

function hideLoading() {
    // No special action needed as the data will replace these placeholders
}

// Error handling functions
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
}

function hideError() {
    errorContainer.style.display = "none";
}

// Initialize app with event listeners and default data
document.addEventListener("DOMContentLoaded", () => {
    // Close modal buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            profileModal.classList.add('hidden');
            alertsModal.classList.add('hidden');
            historyModal.classList.add('hidden');
        });
    });
    
    // Open health profile modal
    setupProfileBtn.addEventListener('click', function() {
        console.log("Setup profile button clicked");
        profileModal.classList.remove('hidden');
    });
    
    // Open alerts modal
    alertDetailsBtn.addEventListener('click', function() {
        console.log("Alert details button clicked");
        alertsModal.classList.remove('hidden');
    });
    
    // Open historical data modal
    historicalDataBtn.addEventListener('click', function() {
        console.log("Historical data button clicked");
        historyModal.classList.remove('hidden');
        // Fetch and display historical data
        displayHistoricalData();
    });
    
    // Tab system for historical data
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and content
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and content
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Health profile form submission
    healthProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveHealthProfile();
        profileModal.classList.add('hidden'); // Hide modal after saving
    });
    
    // Init search and location buttons
    searchBtn.addEventListener("click", () => {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
            hideError();
        } else {
            showError("Please enter a city name.");
        }
    });
    
    searchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            const city = searchInput.value.trim();
            if (city !== "") {
                getWeatherData(city);
                hideError();
            } else {
                showError("Please enter a city name.");
            }
        }
    });
    
    locationBtn.addEventListener("click", function() {
        if (navigator.geolocation) {
            showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    getWeatherDataByCoords(lat, lon);
                    hideError();
                },
                (error) => {
                    hideLoading();
                    showError("Unable to retrieve your location. Please enable location services.");
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            showError("Geolocation is not supported by your browser.");
        }
    });
    
    // Initialize with a default city
    getWeatherData("London");
});

// Function to create custom weather icons - not needed as we're using OpenWeatherMap icons directly
// This can be expanded in the future to use custom SVG icons

// Function to apply temperature color classes based on temperature value
function applyTemperatureColor(temperature, element) {
    // Remove any existing temperature classes
    element.classList.remove('temp-freezing', 'temp-cold', 'temp-mild', 'temp-warm', 'temp-hot');
    
    // Apply appropriate class based on temperature range (in Celsius)
    if (temperature <= 0) {
        element.classList.add('temp-freezing');
    } else if (temperature <= 10) {
        element.classList.add('temp-cold');
    } else if (temperature <= 20) {
        element.classList.add('temp-mild');
    } else if (temperature <= 30) {
        element.classList.add('temp-warm');
    } else {
        element.classList.add('temp-hot');
    }
}

// Add a function to update health recommendations based on AQI:
async function updateHealthRecommendations(aqi) {
    const healthRecommendationsElem = document.getElementById("health-recommendations");
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-recommendations';
    loadingIndicator.textContent = 'Fetching regional health recommendations...';
    
    // Show loading indicator
    healthRecommendationsElem.textContent = '';
    healthRecommendationsElem.appendChild(loadingIndicator);
    
    // Get the current location and weather conditions
    const cityElement = document.getElementById('city-name');
    const cityName = cityElement ? cityElement.textContent : 'Unknown location';
    const weatherDescElement = document.getElementById('weather-description');
    const weatherDesc = weatherDescElement ? weatherDescElement.textContent : '';
    
    try {
        // Try to get region-specific recommendations
        let recommendations = await getRegionalHealthRecommendations(cityName, aqi, weatherDesc);
        
        // If user has a health profile, enhance the recommendations
        if (userHealthProfile) {
            recommendations = enhanceRecommendationsWithProfile(recommendations, aqi);
        }
        
        healthRecommendationsElem.textContent = recommendations;
    } catch (error) {
        console.error('Error fetching regional recommendations:', error);
        
        // Fallback to local recommendations if the API call fails
        let recommendation;
        
        if (aqi <= 50) {
            recommendation = "Air quality is good in " + cityName + ". It's a great day for outdoor activities. No health concerns for the general population.";
        } else if (aqi <= 100) {
            recommendation = "Air quality is acceptable in " + cityName + ". Most people can safely spend time outdoors, but unusually sensitive individuals may want to limit prolonged outdoor exertion.";
        } else if (aqi <= 150) {
            recommendation = "In " + cityName + ", members of sensitive groups may experience health effects. The general public is less likely to be affected. Consider reducing prolonged or heavy exertion outdoors.";
        } else if (aqi <= 200) {
            recommendation = "In " + cityName + ", everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects. Avoid prolonged outdoor exertion and consider staying indoors.";
        } else if (aqi <= 300) {
            recommendation = "Health warnings of emergency conditions in " + cityName + ". The entire population is more likely to be affected. Avoid all outdoor activities and stay indoors with filtered air.";
        } else {
            recommendation = "Health alert: In " + cityName + ", everyone may experience more serious health effects. Stay indoors, keep windows closed, and use air purifiers if available.";
        }
        
        // Enhance with health profile if available
        if (userHealthProfile) {
            recommendation = enhanceRecommendationsWithProfile(recommendation, aqi);
        }
        
        healthRecommendationsElem.textContent = recommendation;
    }
}

// Function to get region-specific health recommendations
async function getRegionalHealthRecommendations(location, aqi, weatherCondition) {
    try {
        // Create a quality category description based on AQI
        let aqiCategory = '';
        if (aqi <= 50) aqiCategory = 'good';
        else if (aqi <= 100) aqiCategory = 'moderate';
        else if (aqi <= 150) aqiCategory = 'unhealthy for sensitive groups';
        else if (aqi <= 200) aqiCategory = 'unhealthy';
        else if (aqi <= 300) aqiCategory = 'very unhealthy';
        else aqiCategory = 'hazardous';
        
        console.log(`Fetching health recommendations for ${location} with ${aqiCategory} air quality and ${weatherCondition} conditions`);
        
        // Try to fetch regional health advisory from an external source
        const externalAdvice = await fetchExternalHealthAdvisory(location, aqi, weatherCondition);
        
        // If we got external advice, use it
        if (externalAdvice) {
            return externalAdvice;
        }
        
        // Otherwise, build our own region-specific advice
        let regionSpecificAdvice = '';
        
        // Add weather-specific advice
        if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
            regionSpecificAdvice += `With current rainy conditions in ${location}, air quality may improve as rain helps clear pollutants. `;
        } else if (weatherCondition.includes('snow')) {
            regionSpecificAdvice += `Snow conditions in ${location} may temporarily improve air quality, but cold air can trap pollutants closer to the ground. `;
        } else if (weatherCondition.includes('fog') || weatherCondition.includes('mist')) {
            regionSpecificAdvice += `Foggy conditions in ${location} can trap pollutants at ground level. `;
        } else if (weatherCondition.includes('wind') || weatherCondition.includes('storm')) {
            regionSpecificAdvice += `Windy conditions in ${location} may help disperse pollutants, but can also bring in pollution from other areas. `;
        }
        
        // Add location context based on patterns (coastal, urban, etc.)
        if (location.match(/Miami|San Diego|Seattle|Boston|Vancouver|Sydney|Hong Kong/i)) {
            regionSpecificAdvice += `Coastal cities like ${location} often have better air circulation, but sea spray can affect those with respiratory conditions. `;
        } else if (location.match(/Beijing|Los Angeles|Mexico City|Delhi|Cairo|Shanghai/i)) {
            regionSpecificAdvice += `${location} is known for challenging air quality conditions due to geographical features that can trap pollution. Extra caution is advised. `;
        } else if (location.match(/Denver|Mexico City|Bogota|Quito|La Paz/i)) {
            regionSpecificAdvice += `The high altitude of ${location} can make breathing more difficult when combined with poor air quality. `;
        }
        
        // Add seasonal advice
        const currentMonth = new Date().getMonth();
        if ([11, 0, 1].includes(currentMonth)) { // Winter (Dec, Jan, Feb)
            regionSpecificAdvice += `Winter conditions can create temperature inversions that trap pollutants. `;
        } else if ([5, 6, 7].includes(currentMonth)) { // Summer (Jun, Jul, Aug)
            regionSpecificAdvice += `Summer heat can increase ozone formation. Stay hydrated and limit outdoor activities during peak heat hours. `;
        } else if ([8, 9, 10].includes(currentMonth)) { // Fall (Sep, Oct, Nov)
            if (location.match(/California|Oregon|Washington|Colorado|Montana|Idaho/i)) {
                regionSpecificAdvice += `Fall wildfire season may affect air quality in your region. `;
            }
        } else if ([2, 3, 4].includes(currentMonth)) { // Spring (Mar, Apr, May)
            regionSpecificAdvice += `Spring pollen can compound respiratory issues when combined with air pollution. `;
        }
        
        // Base recommendation on AQI level
        let baseRecommendation = '';
        if (aqi <= 50) {
            baseRecommendation = `Air quality is good in ${location}. It's a great day for outdoor activities. No health concerns for the general population.`;
        } else if (aqi <= 100) {
            baseRecommendation = `Air quality is acceptable in ${location}. Most people can safely spend time outdoors, but unusually sensitive individuals may want to limit prolonged outdoor exertion.`;
        } else if (aqi <= 150) {
            baseRecommendation = `In ${location}, members of sensitive groups may experience health effects. The general public is less likely to be affected. Consider reducing prolonged or heavy exertion outdoors.`;
        } else if (aqi <= 200) {
            baseRecommendation = `In ${location}, everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects. Avoid prolonged outdoor exertion and consider staying indoors.`;
        } else if (aqi <= 300) {
            baseRecommendation = `Health warnings of emergency conditions in ${location}. The entire population is more likely to be affected. Avoid all outdoor activities and stay indoors with filtered air.`;
        } else {
            baseRecommendation = `Health alert: In ${location}, everyone may experience more serious health effects. Stay indoors, keep windows closed, and use air purifiers if available.`;
        }
        
        // Combine advice
        return regionSpecificAdvice + baseRecommendation;
        
    } catch (error) {
        console.error('Error fetching regional health recommendations:', error);
        throw error; // propagate the error to trigger fallback recommendations
    }
}

// Function to fetch external health advisory from real sources when available
async function fetchExternalHealthAdvisory(location, aqi, weatherCondition) {
    try {
        // In a real implementation, this would make API calls to external services
        // For example, using the Google Maps Air Quality API or AirNow.gov API
        
        // For demonstration purposes, we'll simulate a network request with a timeout
        // and return null to indicate no external data available
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This is where you would normally call an actual API:
        // const response = await fetch(`https://api.example.com/air-quality/health-recommendations?location=${encodeURIComponent(location)}&aqi=${aqi}`);
        // if (response.ok) {
        //     const data = await response.json();
        //     return data.recommendation;
        // }
        
        // For regions with known air quality issues, provide more specific recommendations
        // This simulates getting specialized advice from an external API
        if (location.match(/Delhi|Beijing|Shanghai|Mumbai|Lahore|Dhaka|Karachi|Cairo|Kabul/i) && aqi > 150) {
            return `EXTERNAL HEALTH ADVISORY FOR ${location.toUpperCase()}: The air quality is currently at dangerous levels. Local authorities advise wearing N95 masks outdoors. Children, elderly, and those with respiratory conditions should remain indoors with air purifiers if available. Schools may be closed and outdoor activities restricted. Check local government websites for emergency measures in place.`;
        }
        
        if (location.match(/Los Angeles|San Francisco|Portland|Seattle/i) && weatherCondition.includes('smoke')) {
            return `WILDFIRE SMOKE ADVISORY FOR ${location.toUpperCase()}: Smoke from nearby wildfires is affecting air quality. Stay indoors with windows and doors closed. Use HEPA air purifiers if available. Limit outdoor activities and wear N95 masks if you must go outside. Check local fire department updates for evacuation notices.`;
        }
        
        if (location.match(/Sydney|Melbourne|Brisbane|Perth/i) && [11, 0, 1].includes(new Date().getMonth())) {
            return `SUMMER HEAT AND AIR QUALITY ADVISORY FOR ${location.toUpperCase()}: High temperatures combined with current air quality levels increase health risks. Stay hydrated, use air conditioning when possible, and avoid outdoor activities during peak heat hours (11am-3pm). Check on vulnerable neighbors and follow local health department guidelines.`;
        }
        
        // Return null to indicate no external data was available
        return null;
        
    } catch (error) {
        console.error('Error fetching external health advisory:', error);
        return null; // Return null so we fall back to our own recommendations
    }
}

// 1. Health Profile System
function saveHealthProfile() {
    const ageGroup = document.getElementById('age-group').value;
    const respiratory = document.getElementById('respiratory').checked;
    const cardiovascular = document.getElementById('cardiovascular').checked;
    const allergies = document.getElementById('allergies').checked;
    const skin = document.getElementById('skin').checked;
    const activityLevel = document.getElementById('activity-level').value;
    
    userHealthProfile = {
        ageGroup,
        conditions: {
            respiratory,
            cardiovascular,
            allergies,
            skin
        },
        activityLevel,
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('aerocastHealthProfile', JSON.stringify(userHealthProfile));
    
    // Update the UI to show profile is set up
    updateProfileDisplay();
    
    // Close the modal
    profileModal.classList.add('hidden');
    
    // Update recommendations based on profile
    const aqi = aqiValue.textContent;
    if (aqi && !isNaN(parseInt(aqi))) {
        updateHealthRecommendations(parseInt(aqi));
    }
}

function loadHealthProfile() {
    const savedProfile = localStorage.getItem('aerocastHealthProfile');
    if (savedProfile) {
        userHealthProfile = JSON.parse(savedProfile);
        
        // Pre-fill the form with saved values
        document.getElementById('age-group').value = userHealthProfile.ageGroup;
        document.getElementById('respiratory').checked = userHealthProfile.conditions.respiratory;
        document.getElementById('cardiovascular').checked = userHealthProfile.conditions.cardiovascular;
        document.getElementById('allergies').checked = userHealthProfile.conditions.allergies;
        document.getElementById('skin').checked = userHealthProfile.conditions.skin;
        document.getElementById('activity-level').value = userHealthProfile.activityLevel;
        
        // Update the UI
        updateProfileDisplay();
    }
}

function updateProfileDisplay() {
    if (userHealthProfile) {
        profileStatusMessage.textContent = `Health profile active`;
        setupProfileBtn.textContent = 'Update Profile';
        
        // Show active conditions
        activeSensitivities.classList.remove('hidden');
        // Clear existing sensitivities
        activeSensitivities.innerHTML = '';
        
        if (userHealthProfile.conditions.respiratory) {
            activeSensitivities.innerHTML += `<div class="sensitivity"><i class="fas fa-lungs"></i><span>Respiratory</span></div>`;
        }
        if (userHealthProfile.conditions.cardiovascular) {
            activeSensitivities.innerHTML += `<div class="sensitivity"><i class="fas fa-heart"></i><span>Heart</span></div>`;
        }
        if (userHealthProfile.conditions.allergies) {
            activeSensitivities.innerHTML += `<div class="sensitivity"><i class="fas fa-leaf"></i><span>Allergies</span></div>`;
        }
        if (userHealthProfile.conditions.skin) {
            activeSensitivities.innerHTML += `<div class="sensitivity"><i class="fas fa-sun"></i><span>Skin</span></div>`;
        }
        
        // If no conditions are checked, show a default message
        if (!userHealthProfile.conditions.respiratory && 
            !userHealthProfile.conditions.cardiovascular && 
            !userHealthProfile.conditions.allergies && 
            !userHealthProfile.conditions.skin) {
            activeSensitivities.innerHTML = `<div class="sensitivity"><i class="fas fa-check"></i><span>No health sensitivities</span></div>`;
        }
    } else {
        profileStatusMessage.textContent = 'No health profile set up';
        setupProfileBtn.textContent = 'Set Up Profile';
        activeSensitivities.classList.add('hidden');
    }
}

// 2. Real-Time Weather Alerts System
async function checkWeatherAlerts(data, location) {
    try {
        // Clear previous alerts
        weatherAlerts = [];
        
        // Current weather conditions
        const currentWeather = data.weather[0].main.toLowerCase();
        const currentWeatherDesc = data.weather[0].description.toLowerCase();
        const currentTemp = data.main.temp;
        const windSpeed = data.wind.speed;
        const humidity = data.main.humidity;
        const currentTime = new Date();
        
        // Get coordinates and timezone for region-specific alerts
        const { lat, lon } = data.coord;
        const timezone = data.timezone;
        const localTime = new Date(Date.now() + timezone * 1000);
        const localHour = localTime.getHours();
        const isNight = localHour < 6 || localHour > 19;
        
        // Get season based on month and hemisphere
        const month = localTime.getMonth(); // 0-11
        const isNorthernHemisphere = lat > 0;
        
        let season;
        if (isNorthernHemisphere) {
            // Northern hemisphere seasons
            if (month >= 2 && month <= 4) season = 'spring';
            else if (month >= 5 && month <= 7) season = 'summer';
            else if (month >= 8 && month <= 10) season = 'fall';
            else season = 'winter';
        } else {
            // Southern hemisphere seasons
            if (month >= 2 && month <= 4) season = 'fall';
            else if (month >= 5 && month <= 7) season = 'winter';
            else if (month >= 8 && month <= 10) season = 'spring';
            else season = 'summer';
        }
        
        // Check for region-specific extreme temperatures based on latitude
        const isEquatorial = Math.abs(lat) < 23.5;
        const isPolar = Math.abs(lat) > 66.5;
        const isTemperate = !isEquatorial && !isPolar;
        
        // Temperature thresholds based on region
        let heatThreshold, coldThreshold;
        
        if (isEquatorial) {
            heatThreshold = 38; // Equatorial regions (higher heat threshold)
            coldThreshold = 10; // Equatorial regions (higher cold threshold)
        } else if (isPolar) {
            heatThreshold = 25; // Polar regions (lower heat threshold)
            coldThreshold = -25; // Polar regions (lower cold threshold)
        } else {
            heatThreshold = 35; // Temperate regions
            coldThreshold = -15; // Temperate regions
        }
        
        // Temperature alerts based on regional thresholds
        if (currentTemp > heatThreshold) {
            weatherAlerts.push({
                type: 'Extreme Heat Warning',
                description: `Extreme heat warning for ${location}. Temperature exceeds typical levels for this region. Stay hydrated and seek shade.`,
                severity: 'severe',
                time: localTime.toLocaleString()
            });
        } else if (currentTemp < coldThreshold) {
            weatherAlerts.push({
                type: 'Extreme Cold Warning',
                description: `Extreme cold warning for ${location}. Temperature below typical levels for this region. Limit outdoor exposure.`,
                severity: 'severe',
                time: localTime.toLocaleString()
            });
        }
        
        // Seasonal and region-specific weather alerts
        if (season === 'summer' && isEquatorial && currentTemp > 32 && humidity > 80) {
            weatherAlerts.push({
                type: 'Heat Index Warning',
                description: `High heat and humidity creating dangerous conditions in ${location}. Heat exhaustion risk is elevated.`,
                severity: 'moderate',
                time: localTime.toLocaleString()
            });
        }
        
        if (season === 'winter' && (isTemperate || isPolar) && currentWeatherDesc.includes('snow') && windSpeed > 10) {
            weatherAlerts.push({
                type: 'Blizzard Conditions',
                description: `Blizzard conditions possible in ${location} with high winds and snow. Travel may be hazardous.`,
                severity: 'moderate',
                time: localTime.toLocaleString()
            });
        }
        
        // Time-specific warnings
        if (isNight && currentWeatherDesc.includes('fog')) {
            weatherAlerts.push({
                type: 'Night Fog Advisory',
                description: `Dense fog during nighttime in ${location}. Reduce speed and use low-beam headlights while driving.`,
                severity: 'moderate',
                time: localTime.toLocaleString()
            });
        }
        
        // Monsoon season alerts for specific regions
        const isMonsoonRegion = (lat > 5 && lat < 35 && lon > 60 && lon < 150); // South/Southeast Asia
        const isMonsoonSeason = (isNorthernHemisphere && month >= 5 && month <= 8) || 
                               (!isNorthernHemisphere && month >= 11 && month <= 2);
                               
        if (isMonsoonRegion && isMonsoonSeason && (currentWeatherDesc.includes('rain') || currentWeatherDesc.includes('storm'))) {
            weatherAlerts.push({
                type: 'Monsoon Flood Risk',
                description: `Monsoon rainfall in ${location} may cause flash flooding. Stay alert and avoid flood-prone areas.`,
                severity: 'moderate',
                time: localTime.toLocaleString()
            });
        }
        
        // Check for severe weather conditions
        if (currentWeather.includes('thunderstorm')) {
            weatherAlerts.push({
                type: 'Thunderstorm Warning',
                description: `Thunderstorms in ${location}. Seek shelter indoors and avoid open areas.`,
                severity: 'moderate',
                time: localTime.toLocaleString()
            });
        } else if (currentWeather.includes('tornado')) {
            weatherAlerts.push({
                type: 'Tornado Warning',
                description: `Tornado warning for ${location}. Seek shelter immediately in a basement or interior room.`,
                severity: 'severe',
                time: localTime.toLocaleString()
            });
        } else if (currentWeather.includes('hurricane') || currentWeather.includes('tropical')) {
            weatherAlerts.push({
                type: 'Hurricane Warning',
                description: `Hurricane conditions expected in ${location}. Follow evacuation orders if issued.`,
                severity: 'severe',
                time: localTime.toLocaleString()
            });
        } else if (currentWeather.includes('flood')) {
            weatherAlerts.push({
                type: 'Flood Warning',
                description: `Flooding is occurring or imminent in ${location}. Move to higher ground and avoid flood waters.`,
                severity: 'moderate',
                time: localTime.toLocaleString()
            });
        }
        
        // Wildfire risk alerts for high-risk regions during dry seasons
        const isWildfireRiskRegion = 
            (lat > 30 && lat < 50 && lon > -125 && lon < -110) || // Western US
            (lat > 35 && lat < 45 && lon > 140 && lon < 155) || // Japan
            (lat < -30 && lat > -40 && lon > 140 && lon < 155); // Australia
            
        const isDrySeason = 
            (isNorthernHemisphere && month >= 5 && month <= 9) || // Northern summer/fall
            (!isNorthernHemisphere && month >= 11 && month <= 3); // Southern summer/fall
            
        if (isWildfireRiskRegion && isDrySeason && humidity < 30 && !currentWeatherDesc.includes('rain')) {
            weatherAlerts.push({
                type: 'Fire Weather Warning',
                description: `High wildfire danger in ${location} due to dry conditions. Avoid activities that could cause sparks.`,
                severity: 'moderate',
                time: localTime.toLocaleString()
            });
        }
        
        // Check for air quality alerts (AQI > 150 is unhealthy)
        const aqi = parseInt(aqiValue.textContent);
        if (!isNaN(aqi)) {
            if (aqi > 150 && aqi <= 200) {
                weatherAlerts.push({
                    type: 'Air Quality Alert',
                    description: `Air quality is unhealthy in ${location}. Sensitive groups should avoid outdoor exertion.`,
                    severity: 'moderate',
                    time: localTime.toLocaleString()
                });
            } else if (aqi > 200) {
                weatherAlerts.push({
                    type: 'Severe Air Quality Alert',
                    description: `Air quality is very unhealthy or hazardous in ${location}. Everyone should avoid outdoor activities.`,
                    severity: 'severe',
                    time: localTime.toLocaleString()
                });
            }
        }
        
        // Update the UI with alerts
        displayWeatherAlerts();
        
    } catch (error) {
        console.error('Error checking weather alerts:', error);
    }
}

function displayWeatherAlerts() {
    if (weatherAlerts.length > 0) {
        alertsBanner.classList.remove('hidden');
        
        // Show the most severe alert in the banner
        const mostSevereAlert = weatherAlerts.find(alert => alert.severity === 'severe') || weatherAlerts[0];
        alertMessage.textContent = `${mostSevereAlert.type}: ${mostSevereAlert.description}`;
        
        // Update the alerts modal
        alertsContainer.innerHTML = '';
        weatherAlerts.forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.innerHTML = `
                <div class="alert-title">${alert.type}</div>
                <div class="alert-description">${alert.description}</div>
                <div class="alert-time">${alert.time}</div>
            `;
            alertsContainer.appendChild(alertItem);
        });
    } else {
        alertsBanner.classList.add('hidden');
        alertsContainer.innerHTML = '<p class="no-alerts">No current weather alerts for this location.</p>';
    }
}

// 4. UV Index and Sun Safety
function fetchAndDisplayUVIndex(lat, lon) {
    try {
        // In a real app, this would fetch from OpenWeatherMap's UV Index API
        // For demo purposes, we'll simulate UV data based on weather and location
        
        // Generate a realistic UV index based on time of year, latitude, and weather
        const date = new Date();
        const month = date.getMonth(); // 0-11
        const hour = date.getHours(); // 0-23
        
        // Base UV strength by month (northern hemisphere pattern)
        let baseUV = 0;
        if (month >= 4 && month <= 8) { // Summer months (May-Sep)
            baseUV = 8; // Higher in summer
        } else if (month >= 2 && month <= 3 || month >= 9 && month <= 10) { // Spring/Fall (Mar-Apr, Oct-Nov)
            baseUV = 5; // Moderate in spring/fall
        } else { // Winter months (Dec-Feb)
            baseUV = 3; // Lower in winter
        }
        
        // Adjust by time of day
        let timeMultiplier = 0;
        if (hour >= 10 && hour <= 14) { // Peak sun hours
            timeMultiplier = 1;
        } else if ((hour >= 8 && hour < 10) || (hour > 14 && hour <= 16)) { // Morning/afternoon
            timeMultiplier = 0.7;
        } else if ((hour >= 6 && hour < 8) || (hour > 16 && hour <= 18)) { // Early morning/late afternoon
            timeMultiplier = 0.4;
        } else { // Night time
            timeMultiplier = 0;
        }
        
        // Adjust by latitude (closer to equator = stronger UV)
        let latitudeMultiplier = 1;
        const absLat = Math.abs(lat);
        if (absLat < 20) { // Near equator
            latitudeMultiplier = 1.2;
        } else if (absLat >= 20 && absLat < 40) { // Mid latitudes
            latitudeMultiplier = 1;
        } else { // High latitudes
            latitudeMultiplier = 0.8;
        }
        
        // Calculate final UV index
        let uvIndex = Math.round(baseUV * timeMultiplier * latitudeMultiplier);
        
        // Adjust for weather conditions
        const weatherDesc = document.getElementById('weather-description').textContent.toLowerCase();
        if (weatherDesc.includes('cloud') || weatherDesc.includes('overcast')) {
            uvIndex = Math.max(1, Math.round(uvIndex * 0.7)); // Clouds reduce UV
        } else if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) {
            uvIndex = Math.max(1, Math.round(uvIndex * 0.5)); // Rain reduces UV significantly
        } else if (weatherDesc.includes('snow') || weatherDesc.includes('fog')) {
            uvIndex = Math.max(1, Math.round(uvIndex * 0.3)); // Snow/fog reduces UV even more
        }
        
        displayUVIndex(uvIndex);
        
    } catch (error) {
        console.error('Error fetching UV index:', error);
        // Set a default value if there's an error
        displayUVIndex(0);
    }
}

function displayUVIndex(uvIndex) {
    uvValue.textContent = uvIndex;
    uvIndexDetail.textContent = uvIndex;
    
    // Clear previous classes
    uvValue.className = '';
    
    // Apply color based on UV Index
    let uvCategory, uvColor, uvRecommendation;
    
    if (uvIndex <= 2) {
        uvCategory = 'Low';
        uvColor = 'uv-low';
        uvRecommendation = 'Low UV levels. No protection needed for most people. Wear sunglasses on bright days.';
    } else if (uvIndex <= 5) {
        uvCategory = 'Moderate';
        uvColor = 'uv-moderate';
        uvRecommendation = 'Moderate UV levels. Seek shade during midday hours. Wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. Use SPF 30+ sunscreen.';
    } else if (uvIndex <= 7) {
        uvCategory = 'High';
        uvColor = 'uv-high';
        uvRecommendation = 'High UV levels. Reduce time in the sun between 10 a.m. and 4 p.m. Wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. Apply SPF 30+ sunscreen every 2 hours.';
    } else if (uvIndex <= 10) {
        uvCategory = 'Very High';
        uvColor = 'uv-very-high';
        uvRecommendation = 'Very high UV levels. Minimize sun exposure between 10 a.m. and 4 p.m. Seek shade, wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. Apply SPF 30+ sunscreen every 2 hours.';
    } else {
        uvCategory = 'Extreme';
        uvColor = 'uv-extreme';
        uvRecommendation = 'Extreme UV levels. Avoid sun exposure between 10 a.m. and 4 p.m. Seek shade, wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. Apply SPF 30+ sunscreen every 2 hours.';
    }
    
    // Apply the appropriate class and update the label
    uvValue.classList.add(uvColor);
    uvLabel.textContent = uvCategory;
    
    // Update UV recommendations
    uvRecommendations.textContent = uvRecommendation;
    
    // If user has sensitive skin, add extra recommendations
    if (userHealthProfile && userHealthProfile.conditions.skin) {
        uvRecommendations.textContent += ' As you have sensitive skin, take extra precautions and consider using higher SPF protection.';
    }
}

// 6. Historical Trends and Seasonal Analysis
function fetchHistoricalData(location) {
    // In a real app, this would call an API for historical weather data
    // For demo purposes, we'll create simulated historical data
    
    // Make sure we have current temperature and AQI data
    const currentTemp = parseFloat(temperature.textContent);
    const currentAQI = parseInt(aqiValue.textContent);
    
    // If the AQI value hasn't been set yet, use a default value
    const aqiVal = isNaN(currentAQI) ? 50 : currentAQI;
    
    // Simulate temperature comparison with historical average
    // We'll randomly generate a historical average that's slightly different from current
    const historicalAvgTemp = currentTemp + (Math.random() * 8 - 4); // +/- 4 degrees from current
    const tempDifference = (currentTemp - historicalAvgTemp).toFixed(1);
    const tempTrendType = tempDifference > 0 ? 'trend-up' : tempDifference < 0 ? 'trend-down' : 'trend-neutral';
    
    // Simulate AQI comparison with historical data
    // We'll randomly generate a historical average that's slightly different from current
    const historicalAvgAQI = Math.max(1, aqiVal + (Math.random() * 40 - 20)); // +/- 20 AQI from current
    const aqiDifference = (aqiVal - historicalAvgAQI).toFixed(0);
    const aqiTrendType = aqiDifference > 0 ? 'trend-up' : aqiDifference < 0 ? 'trend-down' : 'trend-neutral';
    
    // Store historical data
    historicalData = {
        temperature: {
            current: currentTemp,
            historical: historicalAvgTemp,
            difference: tempDifference,
            trendType: tempTrendType
        },
        aqi: {
            current: aqiVal,
            historical: historicalAvgAQI,
            difference: aqiDifference,
            trendType: aqiTrendType
        },
        simulated: true
    };
    
    // Display the trend data
    displayTrends();
}

function displayTrends() {
    if (!historicalData) return;
    
    // Update temperature trend
    const tempTrendHTML = `
        <span class="value">${historicalData.temperature.difference > 0 ? '+' : ''}${historicalData.temperature.difference}°C</span>
        <i class="fas fa-arrow-${historicalData.temperature.difference > 0 ? 'up' : historicalData.temperature.difference < 0 ? 'down' : 'right'}"></i>
    `;
    tempTrend.innerHTML = tempTrendHTML;
    tempTrend.className = 'trend-indicator ' + historicalData.temperature.trendType;
    
    // Update AQI trend
    const aqiTrendHTML = `
        <span class="value">${historicalData.aqi.difference > 0 ? '+' : ''}${historicalData.aqi.difference}</span>
        <i class="fas fa-arrow-${historicalData.aqi.difference > 0 ? 'up' : historicalData.aqi.difference < 0 ? 'down' : 'right'}"></i>
    `;
    aqiTrend.innerHTML = aqiTrendHTML;
    aqiTrend.className = 'trend-indicator ' + historicalData.aqi.trendType;
}

function displayHistoricalData() {
    // In a real app, this would populate the charts with actual historical data
    // For demo purposes, we'll create a more visually appealing placeholder
    
    // Create a simulated temperature chart
    const tempChartElement = document.getElementById('temp-chart');
    tempChartElement.innerHTML = createSimulatedChart('Temperature', '°C', 'Last 30 Days', 'temperature');
    
    // Create a simulated precipitation chart
    const precipChartElement = document.getElementById('precip-chart');
    precipChartElement.innerHTML = createSimulatedChart('Precipitation', 'mm', 'Last 30 Days', 'precipitation');
    
    // Create a simulated AQI chart
    const aqiChartElement = document.getElementById('aqi-chart');
    aqiChartElement.innerHTML = createSimulatedChart('Air Quality Index', 'AQI', 'Last 30 Days', 'aqi');
}

// Helper function to create simulated chart visual
function createSimulatedChart(title, unit, timeframe, chartType) {
    const barCount = 14; // Number of bars in our chart
    const bars = [];
    const now = new Date();
    const dayLabels = [];
    
    // Generate day labels (past 14 days)
    for (let i = barCount - 1; i >= 0; i--) {
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - i);
        dayLabels.push(pastDate.getDate());
    }
    
    // Generate data values based on chart type
    let baseValue = 0;
    let baseVariance = 0;
    
    switch(chartType) {
        case 'temperature':
            baseValue = 20; // Average temperature around 20°C
            baseVariance = 10; // Variance of +/- 10°C
            break;
        case 'precipitation':
            baseValue = 5; // Average precipitation around 5mm
            baseVariance = 20; // Variance of +/- 20mm
            break;
        case 'aqi':
            baseValue = 50; // Average AQI around 50
            baseVariance = 75; // Variance of +/- 75 AQI
            break;
        default:
            baseValue = 50;
            baseVariance = 30;
    }
    
    // Generate more realistic data with trends
    let currentValue = baseValue + (Math.random() * baseVariance - baseVariance/2);
    const values = [];
    const maxValueForHeight = baseValue + baseVariance * 1.2; // For scaling the height
    
    for (let i = 0; i < barCount; i++) {
        // Add some day-to-day correlation
        const change = (Math.random() * baseVariance/3) - (baseVariance/6);
        currentValue = Math.max(0, currentValue + change);
        values.push(parseFloat(currentValue.toFixed(1)));
    }
    
    // Calculate statistics
    const avgValue = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1);
    const maxValue = Math.max(...values).toFixed(1);
    const minValue = Math.min(...values).toFixed(1);
    
    // Create bars with height proportional to value
    for (let i = 0; i < barCount; i++) {
        const value = values[i];
        const heightPercent = Math.max(5, Math.min(100, (value / maxValueForHeight) * 100));
        const displayValue = value + (chartType === 'precipitation' && value < 0.1 ? '0' : ''); // Format for trace amounts
        
        bars.push(`<div class="chart-bar" 
                      style="height: ${heightPercent}%;" 
                      data-value="${displayValue}${unit}" 
                      data-day="${dayLabels[i]}"></div>`);
    }
    
    // Create day labels
    const dayLabelsHtml = dayLabels.map(day => `<div class="day-label">${day}</div>`).join('');
    
    return `
        <div class="chart-container ${chartType}-chart">
            <div class="chart-header">
                <h4>${title} Trends</h4>
                <p>${timeframe}</p>
            </div>
            <div class="chart-body">
                <div class="chart-y-axis">
                    <span>High</span>
                    <span>Med</span>
                    <span>Low</span>
                </div>
                <div class="chart-bars">
                    ${bars.join('')}
                </div>
            </div>
            <div class="day-labels">
                ${dayLabelsHtml}
            </div>
            <div class="chart-footer">
                <p><strong>Average:</strong> ${avgValue}${unit} | <strong>Range:</strong> ${minValue}${unit} - ${maxValue}${unit}</p>
            </div>
        </div>
    `;
}

// 7. Clothing & Gear Recommendations
function generateClothingRecommendations(data) {
    const temp = Math.round(data.main.temp);
    const weatherDesc = data.weather[0].description.toLowerCase();
    const windSpeed = data.wind.speed;
    const humidity = data.main.humidity;
    
    let recommendation = '';
    let activeIcons = [];
    
    // Temperature-based recommendations
    if (temp <= 0) {
        recommendation = 'Heavy winter coat, thermal layers, gloves, hat, and warm boots recommended. ';
        activeIcons.push('clothing-icon-1');
    } else if (temp <= 10) {
        recommendation = 'Winter coat, sweater, long pants, and closed shoes recommended. ';
        activeIcons.push('clothing-icon-1');
    } else if (temp <= 20) {
        recommendation = 'Light jacket or sweater and long pants recommended. ';
    } else if (temp <= 25) {
        recommendation = 'Light clothing such as t-shirts and shorts or light pants. ';
    } else {
        recommendation = 'Very light, breathable clothing. Stay in shade when possible. ';
    }
    
    // Weather condition recommendations
    if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) {
        recommendation += 'Bring an umbrella and waterproof jacket. Water-resistant footwear advised. ';
        activeIcons.push('clothing-icon-2');
    } else if (weatherDesc.includes('snow')) {
        recommendation += 'Waterproof boots and snow gear recommended. ';
        activeIcons.push('clothing-icon-2');
    }
    
    // UV-based recommendations
    const uvIndex = parseInt(uvValue.textContent);
    if (uvIndex >= 3 && !weatherDesc.includes('rain') && !weatherDesc.includes('snow')) {
        recommendation += 'Sunscreen, sunglasses, and a hat recommended for UV protection. ';
        activeIcons.push('clothing-icon-3');
    }
    
    // Wind-based recommendations
    if (windSpeed > 5.5) { // > 20 km/h
        recommendation += 'Windy conditions expected. Consider a windbreaker. ';
    }
    
    // Humidity-based recommendations
    if (temp > 25 && humidity > 70) {
        recommendation += 'High humidity - lightweight, breathable fabrics recommended. ';
    }
    
    // Display the recommendations
    clothingRecommendation.textContent = recommendation;
    
    // Activate the appropriate icons
    clothingIcons.forEach(icon => {
        icon.classList.remove('active');
    });
    
    activeIcons.forEach(iconId => {
        document.getElementById(iconId).classList.add('active');
    });
    
    // Update the general weather recommendations
    updateWeatherRecommendations(temp, weatherDesc, windSpeed, humidity);
}

function updateWeatherRecommendations(temp, weatherDesc, windSpeed, humidity) {
    let recommendation = '';
    
    // Temperature-based recommendations
    if (temp <= 0) {
        recommendation = 'Extreme cold conditions. Limit time outdoors to prevent frostbite and hypothermia. Keep pets indoors. ';
    } else if (temp <= 10) {
        recommendation = 'Cold weather conditions. Dress in layers and protect extremities. ';
    } else if (temp >= 35) {
        recommendation = 'Extreme heat conditions. Avoid strenuous activity and stay hydrated. Check on vulnerable individuals. ';
    } else if (temp >= 30) {
        recommendation = 'Very hot conditions. Stay hydrated and take breaks in the shade. ';
    } else {
        recommendation = 'Comfortable temperature conditions. Stay hydrated as needed. ';
    }
    
    // Weather condition specific advice
    if (weatherDesc.includes('thunderstorm')) {
        recommendation += 'Thunderstorms in the area. Seek shelter indoors, avoid open areas and electrical appliances. ';
    } else if (weatherDesc.includes('snow')) {
        recommendation += 'Snowy conditions. Drive carefully if necessary and watch for ice. ';
    } else if (weatherDesc.includes('fog')) {
        recommendation += 'Foggy conditions. Use low beam headlights while driving and maintain safe distances. ';
    } else if (weatherDesc.includes('rain') && windSpeed > 8) {
        recommendation += 'Windy and rainy conditions. Be cautious with umbrellas and watch for flooding. ';
    }
    
    // Add specific advice for user's health profile if available
    if (userHealthProfile) {
        if (userHealthProfile.conditions.respiratory && 
            (weatherDesc.includes('dust') || weatherDesc.includes('fog') || parseInt(aqiValue.textContent) > 100)) {
            recommendation += 'Consider wearing a mask outdoors due to your respiratory sensitivity. ';
        }
        
        if (userHealthProfile.conditions.cardiovascular && (temp <= 0 || temp >= 30)) {
            recommendation += 'With your heart condition, avoid strenuous activities in these temperature extremes. ';
        }
        
        if (userHealthProfile.conditions.allergies && 
            (weatherDesc.includes('pollen') || (temp > 15 && temp < 25 && humidity > 60))) {
            recommendation += 'Allergy conditions may be elevated. Consider taking antihistamines if needed. ';
        }
    }
    
    weatherRecommendations.textContent = recommendation;
}

// New function to enhance recommendations based on user's health profile
function enhanceRecommendationsWithProfile(baseRecommendation, aqi) {
    if (!userHealthProfile) return baseRecommendation;
    
    let enhancedRecommendation = baseRecommendation;
    
    // Add specific advice based on health conditions
    if (userHealthProfile.conditions.respiratory) {
        if (aqi > 50 && aqi <= 100) {
            enhancedRecommendation += " With your respiratory condition, consider limiting prolonged outdoor activities.";
        } else if (aqi > 100) {
            enhancedRecommendation += " Due to your respiratory sensitivity, you should stay indoors with air filtration if possible.";
        }
    }
    
    if (userHealthProfile.conditions.cardiovascular) {
        if (aqi > 100) {
            enhancedRecommendation += " With your heart condition, avoid physical exertion outdoors and stay in clean air environments.";
        }
    }
    
    if (userHealthProfile.conditions.allergies) {
        if (aqi > 50) {
            enhancedRecommendation += " As you have allergies, consider wearing a mask outdoors and taking your allergy medication.";
        }
    }
    
    // Add advice based on age group
    if (userHealthProfile.ageGroup === 'child' || userHealthProfile.ageGroup === 'senior') {
        if (aqi > 100) {
            enhancedRecommendation += ` ${userHealthProfile.ageGroup === 'child' ? 'Children' : 'Seniors'} should take extra precautions and limit outdoor exposure completely.`;
        }
    }
    
    // Add advice based on activity level
    if (userHealthProfile.activityLevel === 'high' || userHealthProfile.activityLevel === 'athlete') {
        if (aqi > 50 && aqi <= 100) {
            enhancedRecommendation += " Consider reducing the intensity of your outdoor workouts.";
        } else if (aqi > 100) {
            enhancedRecommendation += " Move your high-intensity workouts indoors to a filtered air environment.";
        }
    }
    
    return enhancedRecommendation;
}