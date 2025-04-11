<script lang="ts">
	import { focusTrap, getToastStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	let isFocused: boolean = true;
	let name: string = '';
	let type: string = '';
	let quantity: string = '';
	let price: number = 0;

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	async function handleSubmit() {
		try {
			const formData = new FormData();
			formData.append('name', name);
			formData.append('type', type);
			formData.append('quantity', quantity);
			formData.append('price', price);

			const response = await fetch('/api/admin/supply/insert', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			toastSettings.message = result.message;
			toastSettings.background = 'bg-green-500';
			toastStore.trigger(toastSettings);
			// window.location.reload();
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	}
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={handleSubmit}
>
	<h2 class="text-2xl font-bold mb-4">Create Supply</h2>

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
			<span>Quantity (Kg)</span>
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
		<button type="submit" class="px-4 py-2 btn variant-filled-primary"> Submit </button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
