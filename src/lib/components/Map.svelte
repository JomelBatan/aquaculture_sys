<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	// Props
	export let onLocationSelect: ((lat: number, lng: number) => void) | null = null;
	export let initialLat = 11.5847; // Roxas City coordinates
	export let initialLng = 122.7519;
	export let initialZoom = 14; // Slightly increased zoom for better city view
	export let isInteractive = false; // New prop to control interactivity

	let map: L.Map;
	let marker: L.Marker;
	let L: any;

	// Toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	onMount(async () => {
		// Dynamically import Leaflet on the client side
		const leaflet = await import('leaflet');
		L = leaflet.default;

		// Create custom icon for marker
		const customIcon = L.icon({
			iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		// Initialize map
		map = L.map('map', {
			center: [initialLat, initialLng],
			zoom: initialZoom,
			zoomControl: true,
			scrollWheelZoom: isInteractive // Only allow zoom when interactive
		});

		// Add OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
			maxZoom: 19
		}).addTo(map);

		// Add initial marker if coordinates are provided
		if (initialLat && initialLng) {
			marker = L.marker([initialLat, initialLng], { icon: customIcon })
				.addTo(map)
				.bindPopup('Selected Location')
				.openPopup();
		}

		// Only add click handler if the map is interactive and onLocationSelect is provided
		if (isInteractive && onLocationSelect) {
			map.on('click', (e: L.LeafletMouseEvent) => {
				const { lat, lng } = e.latlng;

				// Remove existing marker if any
				if (marker) {
					marker.remove();
				}

				// Add new marker with custom icon
				marker = L.marker([lat, lng], { icon: customIcon })
					.addTo(map)
					.bindPopup('Selected Location')
					.openPopup();

				// Call the callback with new coordinates
				onLocationSelect(lat, lng);

				// Show success toast
				toastSettings.message = `Location selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
				toastSettings.background = 'bg-green-500';
				toastStore.trigger(toastSettings);
			});
		}

		// Add scale control
		L.control.scale().addTo(map);

		// Clean up on component destruction
		return () => {
			map.remove();
		};
	});
</script>

<div class="map-container">
	<div id="map" class="w-full h-[400px] rounded-lg shadow-lg"></div>
	{#if isInteractive}
		<div class="text-sm text-gray-600 mt-2">Click on the map to select a location</div>
	{/if}
</div>

<style>
	:global(.leaflet-container) {
		z-index: 0;
	}

	.map-container {
		position: relative;
	}
</style>
