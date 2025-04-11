<script lang="ts">
	import { focusTrap, getToastStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();
	// Get the pondId from the drawer meta
	$: pondId = $drawerStore?.meta?.pondId;

	const isFocused = true;
	let temperature: number;
	let phLevel: number;
	let dissolvedOxygen: number;
	let ammoniaLevel: number;
	let nitriteLevel: number;
	let salinity: number;

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
			let response = await fetch('/api/admin/pond/water-quality/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pondId,
					temperature,
					phLevel,
					dissolvedOxygen,
					ammoniaLevel,
					nitriteLevel,
					salinity
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
	<h2 class="text-2xl font-bold mb-4">Create Water Quality</h2>

	<div class="flex flex-col gap-4 mb-4">
		<label>
			<span>Temperature</span>
			<input class="input" type="number" name="temperature" bind:value={temperature} required />
		</label>
		<label>
			<span>pH Level</span>
			<input class="input" type="number" name="phLevel" bind:value={phLevel} step="0.01" required />
		</label>
		<label>
			<span>Dissolved Oxygen</span>
			<input
				class="input"
				type="number"
				name="dissolvedOxygen"
				bind:value={dissolvedOxygen}
				step="0.01"
				required
			/>
		</label>
		<label>
			<span>Ammonia Level</span>
			<input
				class="input"
				type="number"
				name="ammoniaLevel"
				bind:value={ammoniaLevel}
				step="0.01"
				required
			/>
		</label>
		<label>
			<span>Nitrite Level</span>
			<input
				class="input"
				type="number"
				name="nitriteLevel"
				bind:value={nitriteLevel}
				step="0.01"
				required
			/>
		</label>
		<label>
			<span>Salinity</span>
			<input
				class="input"
				type="number"
				name="salinity"
				bind:value={salinity}
				step="0.01"
				required
			/>
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary"> Submit </button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
