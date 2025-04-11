<script lang="ts">
	export let data: any[];
	export let stockings: any[];
	export let drawerStore: any;

	function getStockingName(stockingId: string): string {
		const stocking = stockings.find((s) => s._id === stockingId);
		return stocking ? stocking.pond.location : 'Unknown';
	}
</script>

<table class="table">
	<thead>
		<tr>
			<th>Date</th>
			<th>Description</th>
			<th>Amount</th>
			<th>Stocking</th>
			<th>Actions</th>
		</tr>
	</thead>
	<tbody>
		{#each data as expense}
			<tr>
				<td>{new Date(expense.date).toLocaleDateString()}</td>
				<td>{expense.description}</td>
				<td>{expense.amount.toFixed(2)}</td>
				<td>{getStockingName(expense.stockingId)}</td>
				<td>
					<div class="flex gap-2">
						<button
							class="btn variant-filled"
							on:click={() => {
								drawerStore.open({
									id: 'update',
									meta: { expense }
								});
							}}
						>
							Edit
						</button>
					</div>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
