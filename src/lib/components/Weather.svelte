<script lang="ts">
	import { onMount } from 'svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';

	export let latitude: number;
	export let longitude: number;
	const toastStore = getToastStore();

	interface WeatherData {
		city: string;
		country: string;
		forecasts: Array<{
			date: string;
			temp: number;
			feels_like: number;
			humidity: number;
			weather: string;
			description: string;
			icon: string;
		}>;
	}

	let weatherData: WeatherData | null = null;
	let isLoading = true;

	async function fetchWeather() {
		try {
			const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
			if (!response.ok) throw new Error('Failed to fetch weather data');
			weatherData = await response.json();
		} catch (error) {
			console.error('Error fetching weather:', error);
			toastStore.trigger({
				message: 'Failed to load weather data',
				background: 'bg-red-500',
				timeout: 5000
			});
		} finally {
			isLoading = false;
		}
	}

	onMount(fetchWeather);

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	function getWeatherIcon(iconCode: string) {
		return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
	}
</script>

<div class="card p-4">
	<h3 class="h3 mb-4">Weather Forecast</h3>

	{#if isLoading}
		<div class="flex justify-center items-center h-32">
			<div class="spinner"></div>
		</div>
	{:else if weatherData}
		<div class="mb-4">
			<h4 class="text-xl font-semibold">
				{weatherData.city}, {weatherData.country}
			</h4>
		</div>

		<div class="flex overflow-x-auto gap-4 pb-4">
			{#each weatherData.forecasts as forecast}
				<div
					class="card p-4 bg-surface-100 hover:bg-surface-200 transition-colors min-w-[200px] flex-shrink-0"
				>
					<div class="text-center">
						<p class="font-semibold">{formatDate(forecast.date)}</p>
						<img
							src={getWeatherIcon(forecast.icon)}
							alt={forecast.description}
							class="mx-auto my-2"
						/>
						<p class="text-2xl font-bold">{Math.round(forecast.temp)}°C</p>
						<p class="text-sm text-surface-500 capitalize">{forecast.description}</p>
						<div class="mt-2 text-sm">
							<p>Feels like: {Math.round(forecast.feels_like)}°C</p>
							<p>Humidity: {forecast.humidity}%</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center text-surface-500">No weather data available</div>
	{/if}
</div>
