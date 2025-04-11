<script lang="ts">
	import { onMount } from 'svelte';
	import { focusTrap, getToastStore, getModalStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings, ModalSettings } from '@skeletonlabs/skeleton';
	import type { Species } from '$lib/utils/types';
	import Create from '$lib/components/forms/species/Create.svelte';

	const drawerStore = getDrawerStore();
	// Get the pondId from the drawer meta
	$: pondId = $drawerStore?.meta?.pondId;

	const isFocused = true;
	let stockingDate: string;
	let stockingDensity: number;
	let averageWeight: number;
	let supplier: string;
	let species: Species[] = [];
	let selectedSpecies: string;

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	const modalStore = getModalStore();

	// Modal settings for species creation
	const modalComponent: ModalSettings = {
		type: 'component',
		component: {
			ref: Create
		},
		title: 'Create Species',
		meta: {
			updateSpecies: refreshSpecies
		}
	};

	onMount(async () => {
		try {
			const response = await fetch('/api/admin/species');
			const result = await response.json();
			species = result.response || [];
		} catch (error) {
			console.error('Failed to fetch species:', error);
			species = [];
		}
	});

	async function refreshSpecies() {
		try {
			const response = await fetch('/api/admin/species');
			const result = await response.json();
			species = result.response || [];
		} catch (error) {
			console.error('Failed to fetch species:', error);
			species = [];
		}
	}
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			let response = await fetch('/api/admin/stocking/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pondId,
					speciesId: selectedSpecies,
					stockingDate,
					stockingDensity,
					averageWeight,
					supplier
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
	<h2 class="text-2xl font-bold mb-4">Create Stocking</h2>

	<div class="flex flex-col gap-4 mb-4">
		<label class="label">
			<span>Stocking Date</span>
			<input class="input" type="date" name="stockingDate" bind:value={stockingDate} required />
		</label>
		<label class="label">
			<span>Species</span>
			<div class="flex gap-2">
				<select class="input flex-1" name="species" bind:value={selectedSpecies}>
					{#each species as item}
						<option value={item._id}>{item.name}</option>
					{/each}
				</select>
				<button
					type="button"
					class="btn variant-filled-secondary"
					on:click={() => modalStore.trigger(modalComponent)}
				>
					Add Species
				</button>
			</div>
		</label>
		<label class="label">
			<span>Stocking Density</span>
			<input
				class="input"
				type="number"
				name="stockingDensity"
				bind:value={stockingDensity}
				required
			/>
		</label>
		<label class="label">
			<span>Average Weight</span>
			<input class="input" type="number" name="averageWeight" bind:value={averageWeight} required />
		</label>
		<label class="label">
			<span>Supplier</span>
			<input class="input" type="text" name="supplier" bind:value={supplier} required />
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary"> Submit </button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
