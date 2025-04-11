<script lang="ts">
	export let data: { predictions: PredictionData };

	interface Metrics {
		revenue: number;
		survivalRate: number;
		growthPeriod: number;
		fcr: number;
		waterQuality: number;
		temperature: number;
		expenses: number;
	}

	interface Prediction {
		pondLocation: string;
		month: number;
		season: string;
		metrics: Metrics;
		confidenceScore: number;
		riskScore: number;
	}

	interface PredictionData {
		predictions: Prediction[];
		seasonalAnalysis: Record<
			string,
			{
				avgRevenue: number;
				avgSurvivalRate: number;
				count: number;
			}
		>;
		recommendations: Recommendation[];
	}

	interface Recommendation {
		pondLocation: string;
		bestMonth: number;
		expectedRevenue: number;
		confidenceScore: number;
		riskScore: number;
		expenses: number;
	}

	// Initialize with default empty values
	let predictionData = data.predictions;

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
</script>

<div class="p-4">
	<h2 class="text-2xl font-bold mb-4">Harvest Predictions</h2>

	{#if predictionData.recommendations?.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Top Recommendations -->
			<div class="card bg-base-100 shadow-xl p-4">
				<div class="card-body">
					<h3 class="card-title">Top Recommendations</h3>
					{#each predictionData.recommendations as rec}
						<div class="p-4 border rounded-lg mb-2">
							<p class="font-bold">{rec.pondLocation}</p>
							<p>Best Month: {monthNames[rec.bestMonth - 1]}</p>
							<p>Expected Revenue: ₱{rec.expectedRevenue.toLocaleString()}</p>
							<p>Estimated Expenses: ₱{(rec.expenses || 0).toLocaleString()}</p>
							<div class="flex justify-between mt-2">
								<span class="text-sm">
									Confidence: {(rec.confidenceScore * 100).toFixed(1)}%
								</span>
								<span class="text-sm">
									Risk: {(rec.riskScore * 100).toFixed(1)}%
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Seasonal Analysis -->
			<div class="card bg-base-100 shadow-xl p-4">
				<div class="card-body">
					<h3 class="card-title">Seasonal Performance</h3>
					<div class="p-4 border rounded-lg mb-2">
						<p class="font-bold">Dry Season (December - May)</p>
						<p>
							Average Revenue: ₱{predictionData.seasonalAnalysis['Dry']
								? Math.round(predictionData.seasonalAnalysis['Dry'].avgRevenue).toLocaleString()
								: '0'}
						</p>
						<p>
							Average Survival: {predictionData.seasonalAnalysis['Dry']
								? predictionData.seasonalAnalysis['Dry'].avgSurvivalRate.toFixed(1)
								: '0'}%
						</p>
						<p class="text-sm text-gray-600">
							Ideal for high-value species due to stable water conditions
						</p>
						<p class="text-sm text-gray-600">Lower disease risk, better feed conversion</p>
					</div>
					<div class="p-4 border rounded-lg mb-2">
						<p class="font-bold">Wet Season (June - November)</p>
						<p>
							Average Revenue: ₱{predictionData.seasonalAnalysis['Wet']
								? Math.round(predictionData.seasonalAnalysis['Wet'].avgRevenue).toLocaleString()
								: '0'}
						</p>
						<p>
							Average Survival: {predictionData.seasonalAnalysis['Wet']
								? predictionData.seasonalAnalysis['Wet'].avgSurvivalRate.toFixed(1)
								: '0'}%
						</p>
						<p class="text-sm text-gray-600">Higher risk of water quality fluctuations</p>
						<p class="text-sm text-gray-600">Requires more intensive management</p>
					</div>
					<div class="p-4 border rounded-lg">
						<p class="font-bold">Transition Periods</p>
						<p class="text-sm text-gray-600">March-May: Prepare for wet season challenges</p>
						<p class="text-sm text-gray-600">
							October-November: Prepare for dry season opportunities
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Detailed Predictions Table -->
		<div class="mt-8">
			<h3 class="text-xl font-bold mb-4">Detailed Analysis</h3>
			<div class="overflow-x-auto">
				<table class="table w-full">
					<thead>
						<tr>
							<th>Location</th>
							<th>Month</th>
							<th>Revenue</th>
							<th>Survival Rate</th>
							<th>Growth Period</th>
							<th>FCR</th>
							<th>Expenses</th>
							<th>Confidence</th>
						</tr>
					</thead>
					<tbody>
						{#each predictionData.predictions as pred}
							<tr>
								<td>{pred.pondLocation}</td>
								<td>{monthNames[pred.month - 1]}</td>
								<td>₱{pred.metrics.revenue.toLocaleString()}</td>
								<td>{pred.metrics.survivalRate}%</td>
								<td>{pred.metrics.growthPeriod} days</td>
								<td>{pred.metrics.fcr?.toFixed(2) || 'N/A'}</td>
								<td>₱{(pred.metrics.expenses || 0).toLocaleString()}</td>
								<td>{(pred.confidenceScore * 100).toFixed(1)}%</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<div class="alert alert-info">
			<p>Loading predictions or no data available...</p>
		</div>
	{/if}
</div>
