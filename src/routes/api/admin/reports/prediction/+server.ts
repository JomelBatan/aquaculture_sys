import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

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
	pondId: string;
	month: number;
	season: string;
	pondLocation: string;
	metrics: Metrics;
	confidenceScore: number;
	riskScore: number;
}

export const GET: RequestHandler = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals || Object.keys(locals).length === 0) {
		return json({ status: 'Error', message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const db = await clientPromise();

		// First pipeline: Gather comprehensive historical data
		const analysisPipeline = [
			{
				$lookup: {
					from: 'stockings',
					localField: 'stockingId',
					foreignField: '_id',
					as: 'stocking'
				}
			},
			{ $unwind: '$stocking' },
			{
				$lookup: {
					from: 'ponds',
					localField: 'stocking.pondId',
					foreignField: '_id',
					as: 'pond'
				}
			},
			{ $unwind: '$pond' },
			// Join with feeding data
			{
				$lookup: {
					from: 'feeds',
					localField: 'stockingId',
					foreignField: 'stockingId',
					as: 'feedingData'
				}
			},
			// Join with environmental conditions
			{
				$lookup: {
					from: 'environmentalConditions',
					localField: 'stocking.pondId',
					foreignField: 'pondId',
					as: 'envConditions'
				}
			},
			{
				$group: {
					_id: {
						pondId: '$stocking.pondId',
						month: { $month: { $toDate: '$stocking.stockingDate' } },
						season: {
							$switch: {
								branches: [
									{
										case: { $in: [{ $month: { $toDate: '$stocking.stockingDate' } }, [12, 1, 2]] },
										then: 'Winter'
									},
									{
										case: { $in: [{ $month: { $toDate: '$stocking.stockingDate' } }, [3, 4, 5]] },
										then: 'Spring'
									},
									{
										case: { $in: [{ $month: { $toDate: '$stocking.stockingDate' } }, [6, 7, 8]] },
										then: 'Summer'
									},
									{
										case: { $in: [{ $month: { $toDate: '$stocking.stockingDate' } }, [9, 10, 11]] },
										then: 'Fall'
									}
								],
								default: 'Unknown'
							}
						}
					},
					pondLocation: { $first: '$pond.location' },
					avgRevenue: { $avg: '$revenue' },
					avgSurvivalRate: { $avg: '$survivalRate' },
					avgGrowthPeriod: {
						$avg: {
							$divide: [
								{
									$subtract: [{ $toDate: '$harvestDate' }, { $toDate: '$stocking.stockingDate' }]
								},
								1000 * 60 * 60 * 24 // Convert to days
							]
						}
					},
					avgFCR: { $avg: '$feedingData.fcr' },
					avgWaterQuality: { $avg: '$envConditions.dissolvedOxygen' },
					avgTemperature: { $avg: '$envConditions.temperature' },
					totalFeedUsed: { $sum: '$feedingData.amount' },
					totalStockingCost: { $first: '$stocking.totalCost' },
					laborCost: { $sum: 500 }, // Base labor cost per harvest
					totalHarvests: { $sum: 1 }
				}
			},
			{
				$project: {
					_id: 0,
					pondId: '$_id.pondId',
					month: '$_id.month',
					season: '$_id.season',
					pondLocation: 1,
					metrics: {
						revenue: { $round: ['$avgRevenue', 2] },
						survivalRate: { $round: ['$avgSurvivalRate', 2] },
						growthPeriod: { $round: ['$avgGrowthPeriod', 1] },
						fcr: { $round: ['$avgFCR', 2] },
						waterQuality: { $round: ['$avgWaterQuality', 2] },
						temperature: { $round: ['$avgTemperature', 1] },
						expenses: {
							$round: [
								{
									$add: [
										{ $ifNull: [{ $multiply: ['$totalFeedUsed', 85] }, 0] }, // Feed cost at ₱85 per kg
										{ $ifNull: [{ $multiply: ['$avgGrowthPeriod', 25] }, 0] }, // Daily operational cost at ₱25/day
										{ $ifNull: ['$totalStockingCost', 0] }, // Initial stocking cost
										{ $ifNull: ['$laborCost', 0] }, // Labor cost
										{ $ifNull: [{ $multiply: ['$avgGrowthPeriod', 15] }, 0] } // Utilities and maintenance at ₱15/day
									]
								},
								2
							]
						}
					},
					confidenceScore: {
						$multiply: [
							{ $divide: ['$totalHarvests', 5] },
							{ $divide: ['$avgSurvivalRate', 80] },
							{
								$cond: [{ $gt: ['$recentPerformance', '$avgRevenue'] }, 1.5, 0.8]
							}
						]
					},
					riskScore: {
						$multiply: [
							// Base risk from survival rate
							{ $subtract: [1, { $divide: ['$avgSurvivalRate', 100] }] },
							// Experience factor (decreases risk with more harvests)
							{
								$add: [
									0.5,
									{
										$multiply: [
											0.5,
											{ $subtract: [1, { $min: [1, { $divide: ['$totalHarvests', 5] }] }] }
										]
									}
								]
							},
							// Seasonal volatility factor
							{
								$cond: [
									{ $gt: ['$metrics.waterQuality', 0] },
									{
										$add: [
											0.8,
											{
												$multiply: [
													0.2,
													{ $divide: [{ $subtract: [7, '$metrics.waterQuality'] }, 7] }
												]
											}
										]
									},
									1
								]
							}
						]
					}
				}
			},
			{
				$sort: {
					confidenceScore: -1,
					'metrics.revenue': -1
				}
			}
		];

		const predictions = (await db
			.collection('harvests')
			.aggregate(analysisPipeline)
			.toArray()) as Prediction[];

		// Calculate seasonal patterns with proper averaging
		const seasonalAnalysis = predictions.reduce(
			(
				acc: Record<string, { avgRevenue: number; avgSurvivalRate: number; count: number }>,
				pred: Prediction
			) => {
				const season = pred.season === 'Summer' || pred.season === 'Spring' ? 'Dry' : 'Wet';

				if (!acc[season]) {
					acc[season] = {
						avgRevenue: 0,
						avgSurvivalRate: 0,
						count: 0
					};
				}
				acc[season].avgRevenue += pred.metrics.revenue;
				acc[season].avgSurvivalRate += pred.metrics.survivalRate;
				acc[season].count++;
				return acc;
			},
			{}
		);

		// Calculate the actual averages
		Object.keys(seasonalAnalysis).forEach((season) => {
			seasonalAnalysis[season].avgRevenue = Math.round(
				seasonalAnalysis[season].avgRevenue / seasonalAnalysis[season].count
			);
			seasonalAnalysis[season].avgSurvivalRate = Math.round(
				seasonalAnalysis[season].avgSurvivalRate / seasonalAnalysis[season].count
			);
		});

		return json({
			status: 'Success',
			data: {
				predictions,
				seasonalAnalysis,
				recommendations: predictions.slice(0, 3).map((p: Prediction) => ({
					pondLocation: p.pondLocation,
					bestMonth: p.month,
					expectedRevenue: p.metrics.revenue,
					expenses: p.metrics.expenses,
					confidenceScore: Math.round(p.confidenceScore * 100) / 100,
					riskScore: Math.round(p.riskScore * 100) / 100,
					optimalConditions: {
						growthPeriod: p.metrics.growthPeriod,
						waterQuality: p.metrics.waterQuality,
						temperature: p.metrics.temperature
					}
				}))
			}
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		return json(
			{
				status: 'Error',
				message: errorMessage
			},
			{ status: 500 }
		);
	}
};
