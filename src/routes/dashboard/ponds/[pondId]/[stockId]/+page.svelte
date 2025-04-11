<script lang="ts">
	import { formatDateMDY } from '$lib/utils/dateHelper';

	export let data: any;
	const { stockDetail } = data;

	// Filter variables
	let dateFrom = '';
	let dateTo = '';
	let descriptionFilter = '';
	let minAmount = '';
	let maxAmount = '';

	// Calculate total expenses
	$: totalExpenses = stockDetail.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

	// Filter expenses
	$: filteredExpenses = stockDetail.expenses.filter((expense: any) => {
		const expenseDate = new Date(expense.date);
		const matchesDate =
			(!dateFrom || expenseDate >= new Date(dateFrom)) &&
			(!dateTo || expenseDate <= new Date(dateTo));

		const matchesDescription =
			!descriptionFilter ||
			expense.description.toLowerCase().includes(descriptionFilter.toLowerCase());

		const matchesAmount =
			(!minAmount || expense.amount >= Number(minAmount)) &&
			(!maxAmount || expense.amount <= Number(maxAmount));

		return matchesDate && matchesDescription && matchesAmount;
	});

	// Calculate filtered total
	$: filteredTotal = filteredExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
</script>

<div class="container mx-auto p-4">
	<div class="card">
		<header class="card-header">
			<h2 class="h2">Stocking Details</h2>
		</header>

		<section class="p-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="card p-4">
					<h3 class="h3 mb-4">General Information</h3>
					<div class="space-y-2">
						<p><strong>Species:</strong> {stockDetail.species?.name || 'N/A'}</p>
						<p>
							<strong>Stocking Date:</strong>
							{stockDetail.stockingDate ? formatDateMDY(stockDetail.stockingDate) : 'N/A'}
						</p>
						<p><strong>Density:</strong> {stockDetail.stockingDensity || 'N/A'} kg/m²</p>
						<p><strong>Average Weight:</strong> {stockDetail.averageWeight || 'N/A'} g</p>
						<p><strong>Supplier:</strong> {stockDetail.supplier || 'N/A'}</p>
						<p><strong>Status:</strong> {stockDetail.isActive ? 'Active' : 'Inactive'}</p>
						<p><strong>Created By:</strong> {stockDetail.createdBy?.name || 'N/A'}</p>
					</div>
				</div>

				<div class="card p-4">
					<h3 class="h3 mb-4">Financial Summary</h3>
					<div class="space-y-2">
						<p><strong>Total Expenses:</strong> ${totalExpenses.toFixed(2)}</p>
					</div>
				</div>
			</div>
		</section>

		<section class="p-4">
			<h3 class="h3 mb-4">Expenses</h3>

			<!-- Add filters -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
				<label class="label">
					<span>Date From</span>
					<input type="date" class="input" bind:value={dateFrom} />
				</label>

				<label class="label">
					<span>Date To</span>
					<input type="date" class="input" bind:value={dateTo} />
				</label>

				<label class="label">
					<span>Description</span>
					<input
						type="text"
						class="input"
						placeholder="Filter by description"
						bind:value={descriptionFilter}
					/>
				</label>

				<label class="label">
					<span>Min Amount ($)</span>
					<input type="number" class="input" step="0.01" bind:value={minAmount} />
				</label>

				<label class="label">
					<span>Max Amount ($)</span>
					<input type="number" class="input" step="0.01" bind:value={maxAmount} />
				</label>

				<div class="flex items-end">
					<p class="text-sm">Filtered Total: ${filteredTotal.toFixed(2)}</p>
				</div>
			</div>

			<div class="table-container">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Date</th>
							<th>Description</th>
							<th>Amount</th>
						</tr>
					</thead>
					<tbody>
						{#if filteredExpenses && filteredExpenses.length > 0}
							{#each filteredExpenses as expense}
								<tr>
									<td>{formatDateMDY(expense.date)}</td>
									<td>{expense.description}</td>
									<td>${expense.amount.toFixed(2)}</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="3" class="text-center">No expenses match the current filters</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</section>
	</div>
</div>
