<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	export let stockings: any[];

	const drawerStore = getDrawerStore();
	const expense = $drawerStore?.meta?.expense;

	let formData = {
		description: expense?.description || '',
		amount: expense?.amount || '',
		stockingId: expense?.stockingId || '',
		date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : ''
	};

	async function handleSubmit() {
		try {
			const form = new FormData();
			form.append('description', formData.description);
			form.append('amount', formData.amount);
			form.append('stockingId', formData.stockingId);
			form.append('date', formData.date);

			const response = await fetch('/api/admin/expense/insert', {
				method: 'POST',
				body: form
			});

			if (response.ok) {
				drawerStore.close();
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to save expense:', error);
		}
	}
</script>

<div class="p-4">
	<h2 class="h3 mb-4">Create Expense</h2>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<label class="label">
			<span>Description</span>
			<input class="input" type="text" bind:value={formData.description} required />
		</label>

		<label class="label">
			<span>Amount</span>
			<input class="input" type="number" step="0.01" bind:value={formData.amount} required />
		</label>

		<label class="label">
			<span>Stocking</span>
			<select class="input" bind:value={formData.stockingId} required>
				<option value="">Select a stocking</option>
				{#each stockings as stocking}
					<option value={stocking._id}>{stocking.pond.location}</option>
				{/each}
			</select>
		</label>

		<label class="label">
			<span>Date</span>
			<input class="input" type="date" bind:value={formData.date} required />
		</label>

		<div class="flex justify-end gap-2">
			<button type="button" class="btn variant-filled" on:click={() => drawerStore.close()}>
				Cancel
			</button>
			<button type="submit" class="btn variant-filled-primary"> Create </button>
		</div>
	</form>
</div>
