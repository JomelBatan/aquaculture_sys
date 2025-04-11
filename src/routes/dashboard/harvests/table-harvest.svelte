<script lang="ts">
	import { formatDateMDY } from '$lib/utils/dateHelper';
	export let data;
</script>

<div class="table-container">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>Pond</th>
				<th>Species</th>
				<th>Stocking Date</th>
				<th>Harvest Date</th>
				<th>Total Weight</th>
				<th>Average Size</th>
				<th>Survival Rate</th>
				<th>Revenue</th>
			</tr>
		</thead>
		<tbody>
			{#if data}
				{#each data as item, i}
					<tr>
						<td>{item?.pond?.location}</td>
						<td>{item?.species?.name}</td>
						<td>{formatDateMDY(item.stocking?.stockingDate)}</td>
						<td>{formatDateMDY(item.harvestDate)}</td>
						<td>{item.totalWeight} kg</td>
						<td>{item.averageSize} cm</td>
						<td>{item.survivalRate}%</td>
						<td>{item.revenue}</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td colspan="6" class="text-center">No data found</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
