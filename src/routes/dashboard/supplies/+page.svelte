<script lang="ts">
	import Table from './table-supplies.svelte';
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import Create from '$lib/components/forms/supply/Create.svelte';
	import Update from '$lib/components/forms/supply/Update.svelte';

	export let data: any;

	let isReady: boolean = false;
	let keyword: string = '';

	// drawer settings
	const drawerCreate: DrawerSettings = {
		id: 'create',
		// Provide your property overrides:
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerStore = getDrawerStore();
	drawerStore.close();

	$: isReady = data !== undefined;
</script>

<div class="card mb-4">
	<header class="card-header">
		<h1 class="h3">Supplies</h1>
	</header>
	{#if !isReady}
		<section class="flex p-4 w-full gap-12 items-center">
			<div class="placeholder animate-pulse w-12" />
			<div class="placeholder animate-pulse w-full" />
		</section>
	{:else}
		<section class="flex p-4 w-full gap-4">
			<button
				type="button"
				class="btn variant-filled-primary"
				on:click={() => drawerStore.open(drawerCreate)}>Create</button
			>
			<input class="input ml-auto" type="text" placeholder="Search" bind:value={keyword} />
		</section>
	{/if}
</div>
{#if isReady}
	{#key data}
		<Table data={data?.supplies} />
	{/key}
{:else}
	<table class="table">
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
	{:else if $drawerStore.id === 'update'}
		<Update supplies={$drawerStore.meta?.supplies} />
	{/if}
</Drawer>
