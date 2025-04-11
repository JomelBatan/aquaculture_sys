<script lang="ts">
	import { page } from '$app/stores';
	import { AppRailAnchor } from '@skeletonlabs/skeleton';
	import {
		Box,
		CashStack,
		FileBarGraph,
		Folder,
		Home,
		PersonBadge,
		Water
	} from '$lib/components/icons/index';
</script>

<AppRailAnchor title="Home" href="/dashboard" selected={$page.url.pathname === '/dashboard'}>
	<svelte:fragment slot="lead">
		<div class="flex items-center justify-center">
			<Home />
		</div>
	</svelte:fragment>
	<span>Home</span>
</AppRailAnchor>
<AppRailAnchor
	title="Ponds"
	href="/dashboard/ponds"
	selected={$page.url.pathname === '/dashboard/ponds'}
>
	<svelte:fragment slot="lead">
		<div class="flex items-center justify-center">
			<Water />
		</div>
	</svelte:fragment>
	<span>Ponds</span>
</AppRailAnchor>
<AppRailAnchor
	title="Expenses"
	href="/dashboard/expenses"
	selected={$page.url.pathname === '/dashboard/expenses'}
>
	<svelte:fragment slot="lead">
		<div class="flex items-center justify-center">
			<CashStack />
		</div>
	</svelte:fragment>
	<span>Expenses</span>
</AppRailAnchor>
<AppRailAnchor
	title="Supplies"
	href="/dashboard/supplies"
	selected={$page.url.pathname === '/dashboard/supplies'}
>
	<svelte:fragment slot="lead">
		<div class="flex items-center justify-center">
			<Box />
		</div>
	</svelte:fragment>
	<span>Supplies</span>
</AppRailAnchor>
<AppRailAnchor
	title="Harvests"
	href="/dashboard/harvests"
	selected={$page.url.pathname === '/dashboard/harvests'}
>
	<svelte:fragment slot="lead">
		<div class="flex items-center justify-center">
			<Box />
		</div>
	</svelte:fragment>
	<span>Harvests</span>
</AppRailAnchor>
<AppRailAnchor
	title="Predictions"
	href="/dashboard/predictions"
	selected={$page.url.pathname === '/dashboard/predictions'}
>
	<svelte:fragment slot="lead">
		<div class="flex items-center justify-center">
			<FileBarGraph />
		</div>
	</svelte:fragment>
	<span>Predictions</span>
</AppRailAnchor>
<AppRailAnchor
	title="Users"
	href="/dashboard/users"
	selected={$page.url.pathname === '/dashboard/users'}
>
	<svelte:fragment slot="lead">
		<div class="flex items-center justify-center">
			<PersonBadge />
		</div>
	</svelte:fragment>
	<span>Users</span>
</AppRailAnchor>
