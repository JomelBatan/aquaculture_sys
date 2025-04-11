<script lang="ts">
	import { focusTrap, getToastStore, getModalStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	// Get the update function from modal meta
	$: updateSpecies = $modalStore[0]?.meta?.updateSpecies;

	let isFocused: boolean = true;
	let name: string,
		type: string,
		optimumTemperature: string,
		optimumpH: string,
		imageFile: File | null = null;

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	async function handleSubmit() {
		try {
			const formData = new FormData();
			formData.append('name', name);
			formData.append('type', type);
			formData.append('optimumTemperature', optimumTemperature);
			formData.append('optimumpH', optimumpH);
			if (imageFile) {
				formData.append('image', imageFile);
			}

			let response = await fetch('/api/admin/species/insert', {
				method: 'POST',
				body: formData
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastSettings.background = 'bg-green-500';
			toastStore.trigger(toastSettings);

			// Call update function if it exists
			if (typeof updateSpecies === 'function') {
				await updateSpecies();
			}

			modalStore.close();
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			imageFile = input.files[0];
		}
	}
</script>

<div class="p-4 variant-filled-surface rounded-lg">
	<form
		method="POST"
		autocomplete="off"
		class="p-6"
		use:focusTrap={isFocused}
		on:submit|preventDefault={handleSubmit}
	>
		<h2 class="text-2xl font-bold mb-4">Create Species</h2>

		<div class="flex flex-col gap-4 mb-4">
			<label>
				<span>Name</span>
				<input class="input" type="text" name="name" bind:value={name} required />
			</label>
			<label>
				<span>Type</span>
				<input class="input" type="text" name="type" bind:value={type} required />
			</label>
			<label>
				<span>Optimum Temperature</span>
				<input
					class="input"
					type="text"
					name="optimumTemperature"
					bind:value={optimumTemperature}
					required
				/>
			</label>
			<label>
				<span>Optimum PH</span>
				<input class="input" type="text" name="optimumpH" bind:value={optimumpH} required />
			</label>
			<label>
				<span>Species Image</span>
				<input
					class="input"
					type="file"
					name="image"
					accept="image/*"
					on:change={handleFileChange}
				/>
			</label>
		</div>

		<div class="flex justify-end space-x-4">
			<button type="submit" class="px-4 py-2 btn variant-filled-primary"> Submit </button>
			<button
				type="button"
				class="btn variant-filled-secondary"
				on:click={() => modalStore.close()}
			>
				Cancel
			</button>
		</div>
	</form>
</div>
