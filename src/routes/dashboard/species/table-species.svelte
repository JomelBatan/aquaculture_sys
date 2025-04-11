<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';

	export let data;

	const drawerStore = getDrawerStore();
	const drawerUpdate: DrawerSettings = {
		id: 'update',
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};
</script>

<div class="table-container">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>Name</th>
				<th>Type</th>
				<th>Optimum Temperature</th>
				<th>Optimum pH</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if data}
				{#each data as item, i}
					<tr>
						<td>{item.name}</td>
						<td>{item.type}</td>
						<td>{item.optimumTemperature}</td>
						<td>{item.optimumpH}</td>
						<td>
							<button
								type="button"
								class="btn variant-filled-primary"
								on:click={() => {
									drawerStore.open({ ...drawerUpdate, meta: { species: item } });
								}}
							>
								Edit
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
