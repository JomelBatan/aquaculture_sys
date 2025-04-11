<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import { onMount } from 'svelte';
	import type { ChartConfiguration } from 'chart.js';

	export let data: {
		chartData: {
			feeds: any[];
			expenses: any[];
			harvests: any[];
			stockings: any[];
		};
	};

	// Filter states
	let startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 30 days
	let endDate = new Date().toISOString().split('T')[0];
	let selectedPond = '';
	let selectedSpecies = '';
	let chartType = 'daily';

	// Chart instances
	let charts: { [key: string]: Chart } = {};

	// Chart configurations
	const chartConfigs: { [key: string]: ChartConfiguration } = {
		feed: {
			type: 'bar',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Morning Feed (kg)',
						backgroundColor: 'rgb(75, 192, 192)',
						data: []
					},
					{
						label: 'Afternoon Feed (kg)',
						backgroundColor: 'rgb(255, 99, 132)',
						data: []
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: { display: true, text: 'Daily Feed Usage' }
				}
			}
		},
		expense: {
			type: 'bar',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Expenses (PHP)',
						backgroundColor: 'rgb(255, 159, 64)',
						data: []
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: { display: true, text: 'Monthly Expenses' }
				}
			}
		},
		revenue: {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Revenue (PHP)',
						borderColor: 'rgb(75, 192, 192)',
						data: []
					},
					{
						label: 'Expenses (PHP)',
						borderColor: 'rgb(255, 99, 132)',
						data: []
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: { display: true, text: 'Revenue vs Expenses' }
				}
			}
		}
	};

	async function fetchChartData() {
		try {
			const params = new URLSearchParams({
				startDate,
				endDate,
				pondId: selectedPond,
				speciesId: selectedSpecies,
				type: chartType
			});

			const response = await fetch(`/api/admin/reports/chart-data?${params}`);
			const result = await response.json();

			if (result.status === 'Success') {
				updateCharts(result.data);
			} else {
				console.error('Failed to fetch chart data:', result.message);
			}
		} catch (error) {
			console.error('Error fetching chart data:', error);
		}
	}

	function updateCharts(chartData: any) {
		// Update Feed Chart
		if (charts.feed && chartData.feeds) {
			charts.feed.data.labels = chartData.feeds.map((f: any) => f._id.date);
			charts.feed.data.datasets[0].data = chartData.feeds.map((f: any) => f.morningFeed);
			charts.feed.data.datasets[1].data = chartData.feeds.map((f: any) => f.afternoonFeed);
			charts.feed.update();
		}

		// Update Expense Chart
		if (charts.expense && chartData.expenses) {
			charts.expense.data.labels = chartData.expenses.map((e: any) => e._id.date);
			charts.expense.data.datasets[0].data = chartData.expenses.map((e: any) => e.totalAmount);
			charts.expense.update();
		}

		// Update Revenue Chart
		if (charts.revenue && chartData.harvests) {
			charts.revenue.data.labels = chartData.harvests.map((h: any) => h.harvestDate);
			charts.revenue.data.datasets[0].data = chartData.harvests.map((h: any) => h.revenue);
			charts.revenue.data.datasets[1].data = chartData.harvests.map((h: any) => h.totalExpenses);
			charts.revenue.update();
		}

		// Update Survival Chart
		if (charts.survival && chartData.harvests) {
			charts.survival.data.labels = chartData.harvests.map((h: any) => h.harvestDate);
			charts.survival.data.datasets[0].data = chartData.harvests.map((h: any) => h.survivalRate);
			charts.survival.update();
		}
	}

	onMount(async () => {
		// Initialize all charts
		Object.entries(chartConfigs).forEach(([key, config]) => {
			const ctx = document.getElementById(`${key}Chart`) as HTMLCanvasElement;
			if (ctx) {
				charts[key] = new Chart(ctx, config);
			}
		});

		// Fetch initial data
		await fetchChartData();
	});
</script>

<div class="p-4">
	<div class="filters mb-4 flex gap-4">
		<label class="form-control">
			<span class="label">Start Date</span>
			<input type="date" class="input" bind:value={startDate} on:change={fetchChartData} />
		</label>

		<label class="form-control">
			<span class="label">End Date</span>
			<input type="date" class="input" bind:value={endDate} on:change={fetchChartData} />
		</label>

		<label class="form-control">
			<span class="label">Pond</span>
			<select class="select" bind:value={selectedPond} on:change={fetchChartData}>
				<option value="">All Ponds</option>
				{#each data.chartData.stockings as stocking}
					<option value={stocking._id.pondId}>
						{stocking.pond.location || 'Unknown Location'}
					</option>
				{/each}
			</select>
		</label>

		<label class="form-control">
			<span class="label">Species</span>
			<select class="select" bind:value={selectedSpecies} on:change={fetchChartData}>
				<option value="">All Species</option>
				{#each data.chartData.stockings as stocking}
					<option value={stocking.speciesId}>
						{stocking.species?.name || 'Unknown Species'}
					</option>
				{/each}
			</select>
		</label>

		<label class="form-control">
			<span class="label">View</span>
			<select class="select" bind:value={chartType} on:change={fetchChartData}>
				<option value="daily">Daily</option>
				<option value="monthly">Monthly</option>
				<option value="yearly">Yearly</option>
			</select>
		</label>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="chart-container p-4 card">
			<canvas id="feedChart"></canvas>
		</div>
		<div class="chart-container p-4 card">
			<canvas id="expenseChart"></canvas>
		</div>
		<div class="chart-container p-4 card">
			<canvas id="revenueChart"></canvas>
		</div>
	</div>
</div>

<style>
	.chart-container {
		min-height: 400px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.form-control {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #4b5563;
	}

	.input,
	.select {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		background: white;
	}
</style>
