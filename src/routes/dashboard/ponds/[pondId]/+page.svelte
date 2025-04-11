<script lang="ts">
	import { getDrawerStore, getToastStore } from '@skeletonlabs/skeleton';
	import WaterQuality from '$lib/components/forms/water-quality/Create.svelte';
	import Stocking from '$lib/components/forms/stocking/Create.svelte';
	import { Drawer } from '@skeletonlabs/skeleton';
	import type { DrawerSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import { formatDateMDY } from '$lib/utils/dateHelper';
	import Map from '$lib/components/Map.svelte';
	import { onMount } from 'svelte';
	import Weather from '$lib/components/Weather.svelte';

	export let data;
	const { pondDetail } = data;
	let hasActiveStocking = false;

	// drawer settings for water quality and stocking
	const drawerWaterQuality: DrawerSettings = {
		id: 'water-quality',
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerStocking: DrawerSettings = {
		id: 'stocking',
		width: 'w-[280px] md:w-[600px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerStore = getDrawerStore();
	const toastStore = getToastStore();

	async function checkActiveStocking(pondId: string) {
		try {
			const response = await fetch(`/api/admin/stocking/check-active/${pondId}`);
			const result = await response.json();
			hasActiveStocking = result.hasActiveStocking;
		} catch (error) {
			console.error('Error checking active stocking:', error);
			toastStore.trigger({
				message: 'Error checking stocking status',
				background: 'bg-red-500',
				timeout: 5000
			});
		}
	}

	onMount(() => {
		if (pondDetail?._id) {
			checkActiveStocking(pondDetail._id);
		}
	});
</script>

<div class="container mx-auto p-4">
	<div class="card">
		<header class="card-header flex justify-between items-center p-4">
			<h2 class="h2">Pond Details</h2>
			<div class="flex gap-2">
				<!-- <button
					type="button"
					class="btn variant-filled-primary"
					on:click={() =>
						drawerStore.open({ ...drawerWaterQuality, meta: { pondId: pondDetail._id } })}
				>
					Add Water Quality Data
				</button> -->
				<button
					type="button"
					class="btn variant-filled-primary"
					disabled={hasActiveStocking}
					on:click={() => drawerStore.open({ ...drawerStocking, meta: { pondId: pondDetail._id } })}
				>
					Add Stocking Data
				</button>
				<button
					type="button"
					class="btn variant-filled-secondary"
					on:click={() => window.history.back()}
				>
					Back
				</button>
			</div>
		</header>

		<section class="p-4">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Basic Information -->
				<div class="card p-4">
					<h3 class="h3 mb-4">Basic Information</h3>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<span class="label">Location</span>
							<p class="font-semibold">{pondDetail?.location || 'Not specified'}</p>
						</div>
						<div>
							<span class="label">Size</span>
							<p class="font-semibold">{pondDetail?.size || 0} m²</p>
						</div>
						<div>
							<span class="label">Depth</span>
							<p class="font-semibold">{pondDetail?.depth || 0} m</p>
						</div>
						<div>
							<span class="label">Water Source</span>
							<p class="font-semibold capitalize">{pondDetail?.waterSource || 'Not specified'}</p>
						</div>
						<div>
							<span class="label">Created By</span>
							<p class="font-semibold">{pondDetail?.createdBy?.fullName || 'Unknown'}</p>
						</div>
						<div>
							<span class="label">Created Date</span>
							<p class="font-semibold">{formatDateMDY(pondDetail?.createdAt) || 'Unknown'}</p>
						</div>
						<div>
							<span class="label">Active Species</span>
							<p class="font-semibold">
								{#if pondDetail?.stockings?.length && pondDetail.stockings[pondDetail.stockings.length - 1]?.isActive}
									{pondDetail.stockings[pondDetail.stockings.length - 1].species.name}
								{:else}
									None
								{/if}
							</p>
						</div>
					</div>
				</div>

				<!-- Map Location -->
				<div class="card p-4">
					<h3 class="h3 mb-4">Location Coordinates</h3>
					<div class="mt-4">
						<Map
							initialLat={pondDetail?.coordinates?.latitude || 11.5847}
							initialLng={pondDetail?.coordinates?.longitude || 122.7519}
							onLocationSelect={() => {}}
							isInteractive={false}
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Weather Forecast -->
		<section class="p-4">
			<Weather
				latitude={pondDetail?.coordinates?.latitude}
				longitude={pondDetail?.coordinates?.longitude}
			/>
		</section>

		<!-- Water Quality History -->
		<section class="p-4">
			<h3 class="h3 mb-4">Water Quality History</h3>
			<div class="table-container">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Date</th>
							<th>Temperature (°C)</th>
							<th>pH Level</th>
							<th>Dissolved Oxygen (mg/L)</th>
							<th>Ammonia (mg/L)</th>
							<th>Nitrite (mg/L)</th>
							<th>Salinity (ppt)</th>
						</tr>
					</thead>
					<tbody>
						{#if pondDetail.water_quality && pondDetail.water_quality.length > 0}
							{#each pondDetail.water_quality as quality}
								<tr>
									<td>{formatDateMDY(quality.createdAt)}</td>
									<td>{quality.temperature}</td>
									<td>{quality.phLevel}</td>
									<td>{quality.dissolvedOxygen}</td>
									<td>{quality.ammoniaLevel}</td>
									<td>{quality.nitriteLevel}</td>
									<td>{quality.salinity}</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="7" class="text-center">No water quality data available</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</section>

		<!-- Stocking History -->
		<section class="p-4">
			<h3 class="h3 mb-4">Stocking History</h3>
			<div class="table-container">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Date</th>
							<th>Type</th>
							<th>Density (kg/m²)</th>
							<th>Average Weight (g)</th>
							<th>Supplier</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{#if pondDetail.stockings && pondDetail.stockings.length > 0}
							{#each pondDetail.stockings as stocking}
								<tr
									class="hover:bg-surface-500/30 cursor-pointer"
									on:click={() =>
										(window.location.href = `/dashboard/ponds/${pondDetail._id}/${stocking._id}`)}
								>
									<td>{stocking?.stockingDate ? formatDateMDY(stocking.stockingDate) : ''}</td>
									<td>{stocking?.species?.name ?? ''}</td>
									<td>{stocking?.stockingDensity ?? ''}</td>
									<td>{stocking?.averageWeight ?? ''}</td>
									<td>{stocking?.supplier ?? ''}</td>
									<td>{stocking?.isActive ? 'Active' : 'Inactive'}</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="6" class="text-center">No stocking data available</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</section>
	</div>
</div>

<Drawer>
	{#if $drawerStore.id === 'water-quality'}
		<WaterQuality />
	{:else if $drawerStore.id === 'stocking'}
		<Stocking />
	{/if}
</Drawer>
