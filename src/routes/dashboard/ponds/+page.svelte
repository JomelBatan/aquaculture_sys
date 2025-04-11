<script lang="ts">
	import Table from './table-pond.svelte';
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import Create from '$lib/components/forms/pond/Create.svelte';
	import WaterQuality from '$lib/components/forms/water-quality/Create.svelte';
	import Stocking from '$lib/components/forms/stocking/Create.svelte';
	import Feeding from '$lib/components/forms/feed/Create.svelte';
	import { goto } from '$app/navigation';
	export let data: any;
	import LocationSelector from './dropdown.svelte';
	import Card from './card.svelte';

	const isReady: boolean = true;
	let keyword = '';
	let sizeFilter = '';
	let depthFilter = '';
	let sourceFilter = '';
	let selectedItem: any;
	let pondList: any = null;
	let isLoading = true;

	function handleLocationChange(data: any) {
		pondList = data;
		isLoading = false;
	}

	// drawer settings
	const drawerCreate: DrawerSettings = {
		id: 'create',
		// Provide your property overrides:
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerStocking: DrawerSettings = {
		id: 'stocking',
		// Provide your property overrides:
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerWaterQuality: DrawerSettings = {
		id: 'water-quality',
		// Provide your property overrides:
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerFeeding: DrawerSettings = {
		id: 'feeding',
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const handleView = (item: { _id: string }) => {
		selectedItem = item;
		goto(`/dashboard/ponds/${item._id}`);
	};

	const drawerStore = getDrawerStore();
	drawerStore.close();

	const filterPonds = (
		ponds: any[],
		filters: {
			keyword: string;
			size: string;
			depth: string;
			source: string;
		}
	): any[] => {
		return ponds.filter((pond) => {
			const matchesKeyword =
				!filters.keyword.trim() ||
				Object.values(pond).some((value) =>
					String(value).toLowerCase().includes(filters.keyword.toLowerCase())
				);

			const matchesSize =
				!filters.size.trim() ||
				String(pond.size).toLowerCase().includes(filters.size.toLowerCase());

			const matchesDepth =
				!filters.depth.trim() ||
				String(pond.depth).toLowerCase().includes(filters.depth.toLowerCase());

			const matchesSource =
				!filters.source.trim() || pond.source.toLowerCase().includes(filters.source.toLowerCase());

			return matchesKeyword && matchesSize && matchesDepth && matchesSource;
		});
	};

	$: filteredPonds = isReady
		? filterPonds(data?.ponds, {
				keyword,
				size: sizeFilter,
				depth: depthFilter,
				source: sourceFilter
			})
		: [];
</script>

<div class="card mb-4">
	<header class="card-header">
		<h1 class="h3">Ponds</h1>
	</header>
	{#if isReady}
		<section class="flex p-4 w-full gap-4">
			<button
				type="button"
				class="btn variant-filled-primary"
				on:click={() => drawerStore.open(drawerCreate)}>Create</button
			>
			<input class="input" type="text" placeholder="Search" bind:value={keyword} />
			<input class="input" type="text" placeholder="Size" bind:value={sizeFilter} />
			<input class="input" type="text" placeholder="Depth" bind:value={depthFilter} />
			<input class="input" type="text" placeholder="Source" bind:value={sourceFilter} />
		</section>
	{:else}
		<section class="flex p-4 w-full gap-12 items-center">
			<div class="placeholder animate-pulse w-12" />
			<div class="placeholder animate-pulse w-full" />
		</section>
	{/if}
</div>

{#if isReady}
	{#key [keyword, sizeFilter, depthFilter, sourceFilter]}
		<LocationSelector onLocationChange={handleLocationChange} />
		{#if isLoading}
			<p class="text-gray-500">Loading pond details...</p>
		{:else if pondList && pondList.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each pondList as pond, index (pond._id)}
					<Card title={`Pond ${String.fromCharCode(65 + index)}`} content={pond._id} {handleView} />
				{/each}
			</div>
		{:else}
			<p class="text-gray-500">No pond data available.</p>
		{/if}

		<!--<Table
			data={filteredPonds}
			{drawerWaterQuality}
			{drawerStocking}
			{drawerFeeding}
			{handleView}
		/>-->
	{/key}
{:else}
	<table class="table">
		<thead>
			<tr>
				<th>Location</th>
				<th>Size</th>
				<th>Depth</th>
				<th>Source</th>
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
		<Create />
	{:else if $drawerStore.id === 'water-quality'}
		<WaterQuality />
	{:else if $drawerStore.id === 'stocking'}
		<Stocking />
	{:else if $drawerStore.id === 'feeding'}
		<Feeding />
	{/if}
</Drawer>
