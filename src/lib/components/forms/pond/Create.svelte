<script lang="ts">
	import { focusTrap, getToastStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import Map from '$lib/components/Map.svelte';

	const drawerStore = getDrawerStore();

	let isFocused: boolean = true;
	let size: number,
		depth: number,
		waterSource: string,
		location: string,
		latitude: number,
		longitude: number;

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	function handleLocationSelect(lat: number, lng: number) {
		latitude = lat;
		longitude = lng;
	}
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			let response = await fetch('/api/admin/pond/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					size,
					depth,
					waterSource,
					location,
					coordinates: {
						latitude,
						longitude
					}
				})
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastSettings.background = 'bg-green-500';
			toastStore.trigger(toastSettings);
			window.location.reload();
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	}}
>
	<h2 class="text-2xl font-bold mb-4">Create Pond</h2>

	<div class="flex flex-col gap-4 mb-4">
		<label>
			<span>Size</span>
			<input class="input" type="number" name="size" step="0.1" bind:value={size} required />
		</label>
		<label>
			<span>Depth</span>
			<input class="input" type="number" name="depth" step="0.1" bind:value={depth} required />
		</label>
		<label>
			<span>Water Source</span>
			<select class="input" name="waterSource" bind:value={waterSource} required>
				<option value="freshwater">Freshwater</option>
				<option value="saltwater">Saltwater</option>
				<option value="brackishwater">Brackishwater</option>
			</select>
		</label>
		<label>
			<span>Location Name</span>
			<input class="input" type="text" name="location" bind:value={location} required />
		</label>
		<label>
			<span>Pin Location on Map</span>
			<Map onLocationSelect={handleLocationSelect} isInteractive={true} />
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary"> Submit </button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
