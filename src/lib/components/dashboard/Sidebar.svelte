<script lang="ts">
	import { page } from '$app/stores';
	import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { Home } from '$lib/components/icons/index';
	import AdminSidebarItem from './admin/SidebarItem.svelte';
</script>

<AppRail>
	{#if $page.data.user?.role === 'ADMINISTRATOR'}
		<AdminSidebarItem />
	{/if}
</AppRail>
