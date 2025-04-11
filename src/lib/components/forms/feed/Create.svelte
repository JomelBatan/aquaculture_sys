<script lang="ts">
	import { onMount } from 'svelte';
	import { focusTrap, getToastStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import type { Supplies } from '$lib/utils/types';

	const drawerStore = getDrawerStore();

	// Get the pondId from the drawer meta
	$: pondId = $drawerStore?.meta?.pondId;

	const isFocused = true;
	let feedingDate: string;
	let feedingTime: string;
	let quantity: number;
	let supplies: Supplies[] = [];
	let fcr: number;
	let selectedSupply: string;

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	onMount(async () => {
		try {
			const response = await fetch('/api/admin/supply');
			const result = await response.json();
			supplies = result.response || [];
		} catch (error) {
			console.error('Failed to fetch species:', error);
			supplies = [];
		}
	});
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			let response = await fetch('/api/admin/feed/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pondId,
					supplyId: selectedSupply,
					feedingDate,
					feedingTime,
					quantity,
					fcr
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
	<h2 class="text-2xl font-bold mb-4">Create Feed</h2>

	<div class="flex flex-col gap-4 mb-4">
		<label class="label">
			<span>Feeding Date</span>
			<input class="input" type="date" name="feedingDate" bind:value={feedingDate} required />
		</label>
		<label class="label">
			<span>Feeding Time</span>
			<input class="input" type="time" name="feedingTime" bind:value={feedingTime} required />
		</label>
		<label class="label">
			<span>Supply</span>
			<select class="input" name="supplies" bind:value={selectedSupply}>
				{#each supplies as item}
					<option value={item._id}>{item.name}</option>
				{/each}
			</select>
		</label>
		<label class="label">
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
		<label class="label">
			<span>Feed Conversion Ratio (FCR)</span>
			<input class="input" type="number" name="fcr" step="0.01" bind:value={fcr} required />
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary"> Submit </button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
