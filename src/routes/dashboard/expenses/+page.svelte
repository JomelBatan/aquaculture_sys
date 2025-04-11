<script lang="ts">
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import Table from './table-expense.svelte';
	import Create from '$lib/components/forms/expense/Create.svelte';
	import Update from '$lib/components/forms/expense/Update.svelte';
	export let data: any;

	const isReady: boolean = true;
	let keyword = '';
	let stockingFilter = '';
	let startDate = '';
	let endDate = '';
	let selectedItem: any;

	// drawer settings
	const drawerCreate: DrawerSettings = {
		id: 'create',
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerStore = getDrawerStore();
	drawerStore.close();

	const filterExpenses = (
		expenses: any[],
		filters: {
			keyword: string;
			stocking: string;
			startDate: string;
			endDate: string;
		}
	): any[] => {
		return expenses.filter((expense) => {
			const matchesKeyword =
				!filters.keyword.trim() ||
				Object.values(expense).some((value) =>
					String(value).toLowerCase().includes(filters.keyword.toLowerCase())
				);

			const matchesStocking = !filters.stocking.trim() || expense.stockingId === filters.stocking;

			const expenseDate = new Date(expense.date);
			const start = filters.startDate ? new Date(filters.startDate) : null;
			const end = filters.endDate ? new Date(filters.endDate) : null;

			const matchesDateRange = (!start || expenseDate >= start) && (!end || expenseDate <= end);

			return matchesKeyword && matchesStocking && matchesDateRange;
		});
	};

	$: filteredExpenses = isReady
		? filterExpenses(data?.expenses, {
				keyword,
				stocking: stockingFilter,
				startDate,
				endDate
			})
		: [];
</script>

<div class="card mb-4">
	<header class="card-header">
		<h1 class="h3">Expenses</h1>
	</header>
	{#if isReady}
		<section class="flex p-4 w-full gap-4">
			<button
				type="button"
				class="btn variant-filled-primary"
				on:click={() => drawerStore.open(drawerCreate)}>Create</button
			>
			<input class="input" type="text" placeholder="Search" bind:value={keyword} />
			<div class="flex gap-2">
				<input class="input" type="date" bind:value={startDate} placeholder="Start Date" />
				<input class="input" type="date" bind:value={endDate} placeholder="End Date" />
			</div>
			<select class="input" bind:value={stockingFilter}>
				<option value="">All Stockings</option>
				{#each data.stockings as stocking}
					<option value={stocking.id}>{stocking.name}</option>
				{/each}
			</select>
		</section>
	{:else}
		<section class="flex p-4 w-full gap-12 items-center">
			<div class="placeholder animate-pulse w-12" />
			<div class="placeholder animate-pulse w-full" />
		</section>
	{/if}
</div>

{#if isReady}
	{#key [keyword, stockingFilter, startDate, endDate]}
		<Table data={filteredExpenses} stockings={data.stockings} {drawerStore} />
	{/key}
{:else}
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
			<tr>
				<td><div class="placeholder animate-pulse"></div></td>
				<td><div class="placeholder animate-pulse"></div></td>
				<td><div class="placeholder animate-pulse"></div></td>
				<td><div class="placeholder animate-pulse"></div></td>
				<td><div class="placeholder animate-pulse"></div></td>
			</tr>
		</tbody>
	</table>
{/if}

<Drawer>
	{#if $drawerStore.id === 'create'}
		<Create stockings={data.stockings} />
	{/if}
	{#if $drawerStore.id === 'update'}
		<Update expense={$drawerStore.meta.expense} stockings={data.stockings} />
	{/if}
</Drawer>
