<script lang="ts">
	import { focusTrap, getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	export let drawerStore: () => void = () => {};
	export let expense: any;
	export let stockings: any[];

	let isFocused: boolean = true;
	let description = expense.description;
	let amount = expense.amount;
	let stockingId = expense.stockingId;
	let date = new Date(expense.date).toISOString().split('T')[0];

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			let response = await fetch('/api/admin/expense/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id: expense._id,
					description,
					amount,
					stockingId,
					date
				})
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastSettings.background = 'bg-green-500';
			toastStore.trigger(toastSettings);
			window.location.reload();
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	}}
>
	<h2 class="text-2xl font-bold mb-4">Update Expense</h2>

	<div class="flex flex-col gap-4 mb-4">
		<label>
			<span>Description</span>
			<input class="input" type="text" name="description" bind:value={description} required />
		</label>
		<label>
			<span>Amount</span>
			<input class="input" type="number" step="0.01" name="amount" bind:value={amount} required />
		</label>
		<label>
			<span>Stocking</span>
			<select class="input" name="stockingId" bind:value={stockingId} required>
				<option value="">Select a stocking</option>
				{#each stockings as stocking}
					<option value={stocking._id}>{stocking.name}</option>
				{/each}
			</select>
		</label>
		<label>
			<span>Date</span>
			<input class="input" type="date" name="date" bind:value={date} required />
		</label>
	</div>

	<div class="flex justify-end space-x-4">
		<button type="submit" class="px-4 py-2 btn variant-filled-primary">Update</button>
		<button type="button" class="btn variant-filled-secondary" on:click={() => drawerStore.close()}>
			Cancel
		</button>
	</div>
</form>
