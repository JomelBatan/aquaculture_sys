<script lang="ts">
	export let title: string = '';
	export let content: string = '';
	export let handleView: (item: { _id: string }) => void;
</script>

<button class="card" on:click={() => handleView({ _id: content })}>
	<h3>{title}</h3>
	<p>{content}</p>
</button>

<style>
	.card {
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		padding: 20px;
		max-width: 600px;
		max-height: 600px;
		margin: 10px;
		text-align: center;
		cursor: pointer;
	}

	.card h3 {
		font-size: 1.5rem;
		margin-bottom: 10px;
		color: #282626;
	}

	.card p {
		font-size: 1rem;
		color: #555;
	}
</style>
