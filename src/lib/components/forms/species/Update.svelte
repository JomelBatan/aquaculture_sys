<script lang="ts">
	import { focusTrap, getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	export let drawerStore: () => void = () => {};
	export let species: any;

	let isFocused: boolean = true;
	let name = species.name;
	let type = species.type;
	let optimumTemperature = species.optimumTemperature;
	let optimumpH = species.optimumpH;

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
			let response = await fetch('/api/admin/species/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id: species._id,
					name,
					type,
					optimumTemperature,
					optimumpH
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
	<h2 class="text-2xl font-bold mb-4">Update Species</h2>

	<div class="flex flex-col gap-4 mb-4">
		<label>
			<span>Name</span>
			<input class="input" type="text" name="name" bind:value={name} required />
		</label>
		<label>
			<span>Type</span>
			<input class="input" type="text" name="type" bind:value={type} required />
		</label>
		<label>
			<span>Optimum Temperature</span>
			<input
				class="input"
				type="text"
				name="optimumTemperature"
				bind:value={optimumTemperature}
				required
			/>
		</label>
		<label>
			<span>Optimum PH</span>
			<input class="input" type="text" name="optimumpH" bind:value={optimumpH} required />
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary">Update</button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
