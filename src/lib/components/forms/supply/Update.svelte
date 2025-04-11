<script lang="ts">
	import { focusTrap, getToastStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();
	export let supplies: any;

	let isFocused: boolean = true;
	let name = supplies.name;
	let type = supplies.type;
	let quantity = supplies.quantity;
	let price = supplies.price;

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
			let response = await fetch('/api/admin/supply/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id: supplies._id,
					name,
					type,
					quantity,
					price
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
			<span>Quantity</span>
			<input
				class="input"
				type="number"
				name="quantity"
				step="0.01"
				bind:value={quantity}
				required
			/>
		</label>
		<label>
			<span>Price (per Kg)</span>
			<input class="input" type="number" name="price" step="0.01" bind:value={price} required />
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary">Update</button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
