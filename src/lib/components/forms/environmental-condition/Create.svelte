<script lang="ts">
	import { focusTrap, getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	export const drawerStore: () => void = () => {};

	let isFocused: boolean = true;
	let weather: string, waterLevel: number, dateRecorded: Date;

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			let response = await fetch('/api/admin/environmental-condition/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					weather,
					waterLevel,
					dateRecorded
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
	<h2 class="text-2xl font-bold mb-4">Create Environmental Condition</h2>

	<div class="flex flex-col gap-4 mb-4">
		<label>
			<span>Weather</span>
			<input class="input" type="text" name="weather" bind:value={weather} required />
		</label>
		<label>
			<span>Water Level</span>
			<input class="input" type="number" name="waterLevel" bind:value={waterLevel} required />
		</label>
		<label>
			<span>Date Recorded</span>
			<input class="input" type="date" name="dateRecorded" bind:value={dateRecorded} required />
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary"> Submit </button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
