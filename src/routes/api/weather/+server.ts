import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

interface WeatherForecast {
	date: string;
	temp: number;
	feels_like: number;
	humidity: number;
	weather: string;
	description: string;
	icon: string;
}

interface OpenWeatherForecast {
	dt: number;
	main: {
		temp: number;
		feels_like: number;
		humidity: number;
	};
	weather: Array<{
		main: string;
		description: string;
		icon: string;
	}>;
}

const OPENWEATHER_API_KEY = env.OPENWEATHER_API_KEY;

export const GET: RequestHandler = async ({ url }) => {
	try {
		const latitude = url.searchParams.get('lat');
		const longitude = url.searchParams.get('lon');
		if (!OPENWEATHER_API_KEY) {
			console.error('OpenWeather API key is missing or undefined');
			return json({ error: 'Weather API key not configured' }, { status: 500 });
		}

		const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;

		const response = await fetch(apiUrl);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Weather API error response:', {
				status: response.status,
				statusText: response.statusText,
				body: errorText
			});
			throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();

		// Process the data to get daily forecasts
		const dailyForecasts = data.list.reduce(
			(acc: WeatherForecast[], forecast: OpenWeatherForecast) => {
				const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];

				if (!acc.find((item) => item.date === date)) {
					acc.push({
						date,
						temp: forecast.main.temp,
						feels_like: forecast.main.feels_like,
						humidity: forecast.main.humidity,
						weather: forecast.weather[0].main,
						description: forecast.weather[0].description,
						icon: forecast.weather[0].icon
					});
				}

				return acc;
			},
			[]
		);

		return json({
			city: data.city.name,
			country: data.city.country,
			forecasts: dailyForecasts.slice(0, 7) // Get next 7 days
		});
	} catch (error) {
		console.error('Error fetching weather data:', error);
		return json({ error: 'Failed to fetch weather data' }, { status: 500 });
	}
};
