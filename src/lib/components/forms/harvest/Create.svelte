<script lang="ts">
	import { focusTrap, getToastStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	export let stocks: any[] = [];
	let isFocused: boolean = true;
	let harvestDate: string,
		totalWeight: number,
		averageSize: number,
		survivalRate: number,
		revenue: number,
		remarks: string;
	let stockingId: string;

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
			let response = await fetch('/api/admin/harvest/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					stockingId,
					harvestDate,
					totalWeight,
					averageSize,
					survivalRate,
					revenue,
					remarks
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
	<h2 class="text-2xl font-bold mb-4">Create Harvest</h2>

	<div class="flex flex-col gap-4 mb-4">
		<label>
			<span>Stock</span>
			<select class="input" name="stockingId" bind:value={stockingId} required>
				<option value="">Select Stock</option>
				{#each stocks as stock}
					<option value={stock.id}>{stock.pond.location}</option>
				{/each}
			</select>
		</label>
		<label>
			<span>Harvest Date</span>
			<input class="input" type="date" name="harvestDate" bind:value={harvestDate} required />
		</label>
		<label>
			<span>Harvest Weight</span>
			<input class="input" type="number" name="totalWeight" bind:value={totalWeight} required />
		</label>
		<label>
			<span>Average Size</span>
			<input class="input" type="number" name="averageSize" bind:value={averageSize} required />
		</label>
		<label>
			<span>Survival Rate</span>
			<input class="input" type="number" name="survivalRate" bind:value={survivalRate} required />
		</label>
		<label>
			<span>Revenue</span>
			<input class="input" type="number" name="revenue" bind:value={revenue} required />
		</label>
		<label>
			<span>Remarks</span>
			<textarea class="textarea" rows="4" placeholder="Remarks" bind:value={remarks} />
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary"> Submit </button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
