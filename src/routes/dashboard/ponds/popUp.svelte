<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let isLoading = true;
	let object = null;
	export let content = '';
	const checkContent = async () => {
		if (content) {
			try {
				const response = await fetch(`/api/admin/pond/pondID/${content}`);
				const result = await response.json();
				object = result.response;
				isLoading = false;
			} catch (error) {
				console.error('Error fetching pond details:', error);
			}
		} else {
			console.log('Content is falsy or empty');
		}
	};

	const closePopup = () => {
		dispatch('close');
		content = '';
	};

	const handleKeydown = (event) => {
		if (event.key === 'Escape') {
			closePopup();
		}
	};

	$: checkContent();
</script>

<!-- Modal (Pop-up) -->
<div class="overlay" tabindex="0" on:click={closePopup} on:keydown={handleKeydown}>
	<div class="popup" on:click|stopPropagation>
		<h2>Pop-Up Title</h2>

		<div class="popup-content">
			<label for="size">Size:</label>
			<input type="text" id="size" name="size" value={size} />

			<label for="depth">Depth:</label>
			<input type="text" id="depth" name="depth" value={depth} />

			<label for="fingerlingType">Type of Fingerling:</label>
			<input type="text" id="fingerlingType" name="fingerlingType" value={fingerlingType} />

			<label for="stockingDate">Date of Stocking:</label>
			<input type="date" id="stockingDate" name="stockingDate" value={stockingDate} />

			<label for="harvestDate">Estimated Day to Harvest:</label>
			<input type="date" id="harvestDate" name="harvestDate" value={harvestDate} />

			<label for="expenses">Estimated Expenses:</label>
			<input type="number" id="expenses" name="expenses" value={expenses} />

			<label for="income">Estimated Income:</label>
			<input type="number" id="income" name="income" value={income} />
		</div>

		<button class="close-btn" on:click={closePopup}>Close</button>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}

	.popup {
		background-color: #fff;
		border-radius: 8px;
		padding: 20px;
		width: 300px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.popup h2 {
		margin-bottom: 15px;
	}

	.popup .close-btn {
		background-color: #dc3545;
		color: white;
		border: none;
		padding: 8px 16px;
		cursor: pointer;
		border-radius: 4px;
	}

	.popup .close-btn:hover {
		background-color: #c82333;
	}
</style>
