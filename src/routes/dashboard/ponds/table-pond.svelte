<script lang="ts">
	import { getDrawerStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	export let data;
	export let drawerWaterQuality: DrawerSettings;
	export let drawerStocking: DrawerSettings;
	export let drawerFeeding: DrawerSettings;
	export let handleView: (item: any) => void;

	const drawerStore = getDrawerStore();
	const toastStore = getToastStore();

	let activeStockings: Record<string, boolean> = {};

	onMount(async () => {
		if (data) {
			for (const pond of data) {
				await checkStockingStatus(pond._id);
			}
		}
	});

	async function handleStockingClick(pondId: string) {
		try {
			const response = await fetch(`/api/admin/stocking/check-active/${pondId}`);
			const result = await response.json();

			activeStockings[pondId] = result.hasActiveStocking;

			if (result.hasActiveStocking) {
				toastStore.trigger({
					message: 'This pond already has an active stocking.',
					background: 'bg-orange-500',
					timeout: 5000
				});
			} else {
				drawerStore.open({ ...drawerStocking, meta: { pondId } });
			}
		} catch (error) {
			console.error('Error checking active stocking:', error);
			toastStore.trigger({
				message: 'Error checking stocking status',
				background: 'bg-red-500',
				timeout: 5000
			});
		}
	}

	async function checkStockingStatus(pondId: string) {
		try {
			const response = await fetch(`/api/admin/stocking/check-active/${pondId}`);
			const result = await response.json();
			activeStockings[pondId] = result.hasActiveStocking;
		} catch (error) {
			console.error('Error checking stocking status:', error);
		}
	}
</script>

<div class="table-container">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>Location</th>
				<th>Size</th>
				<th>Depth</th>
				<th>Current Stocking</th>
				<th>Source</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if data}
				{#each data as item}
					<tr>
						<td>{item.location}</td>
						<td>{item.size} m²</td>
						<td>{item.depth} m</td>
						<td>{item.waterSource}</td>
						<td>
							{#if item.stockings && item.stockings.length > 0 && item.stockings[0].species}
								{item.stockings[0].species.name}
							{:else}
								No active stocking
							{/if}
						</td>
						<td>
							<button
								type="button"
								class="btn variant-filled-secondary"
								on:click={() => handleView(item)}
							>
								View
							</button>
							<button
								type="button"
								class="btn variant-filled-primary"
								on:click={() => handleStockingClick(item._id)}
								disabled={activeStockings[item._id] ?? false}
								class:variant-filled-primary={!activeStockings[item._id]}
								class:variant-filled-surface={activeStockings[item._id]}
							>
								Add Stocking
							</button>
							<!-- <button
								type="button"
								class="btn variant-filled-primary"
								on:click={() =>
									drawerStore.open({ ...drawerWaterQuality, meta: { pondId: item._id } })}
							>
								Set Water Quality
							</button> -->
							<button
								type="button"
								class="btn variant-filled-primary"
								on:click={() => drawerStore.open({ ...drawerFeeding, meta: { pondId: item._id } })}
							>
								Add Feeding
							</button>
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td colspan="5" class="text-center">No data found</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
