// GetWeather/index.js
const WeatherService = require('../src/weather-service');

const weatherService = new WeatherService();

module.exports = async function (context, req) {
    context.log('Weather function processed a request.');

    const location = req.params.location || (req.query.location || '');
    
    if (!location) {
        context.res = {
            status: 400,
            body: { 
                error: 'Please provide a location parameter',
                examples: Object.keys(weatherService.mockWeatherData)
            }
        };
        return;
    }
    
    try {
        const weatherData = await weatherService.getWeatherForLocation(location);
        
        context.res = {
            body: weatherData
        };
    } catch (error) {
        context.log.error('Error in weather function:', error);
        context.res = {
            status: 500,
            body: { error: 'An error occurred processing your request' }
        };
    }
};