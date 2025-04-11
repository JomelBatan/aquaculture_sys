<script lang="ts">
	import { onMount } from 'svelte';

	export let onLocationChange: (data: any) => void;

	let selectedOption = 'Select a Location';
	let options: string[] = ['Select a Location'];

	onMount(async () => {
		try {
			const response = await fetch(`/api/admin/pond/findlocation`);
			const result = await response.json();
			if (Array.isArray(result.response)) {
				options = ['Select a Location', ...result.response];
			} else {
				console.error('Unexpected result format', result);
			}
		} catch (error) {
			console.error('Error fetching locations:', error);
		}
	});

	async function handleChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;

		try {
			const response = await fetch(`/api/admin/pond/${value}`);
			const result = await response.json();

			onLocationChange?.(result.response);
		} catch (error) {
			console.error('Error fetching pond details:', error);
		}
	}
</script>

<div class="flex flex-row gap-4 items-center p-4 bg-white shadow-lg rounded-lg">
	<p class="text-gray-700 font-semibold">Pond Address:</p>

	<select
		bind:value={selectedOption}
		on:change={handleChange}
		class="rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 px-8 py-2 text-gray-800 focus:outline-none transition duration-200 ease-in-out"
	>
		{#each options as option}
			<option value={option} class="text-gray-700">{option}</option>
		{/each}
	</select>
	{#if selectedOption !== 'Select a Location'}
		<p class="text-gray-700">
			Selected: <span class="font-medium text-blue-500">{selectedOption}</span>
		</p>
	{/if}
</div>
