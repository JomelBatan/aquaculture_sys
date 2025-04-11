import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return new Response(
			JSON.stringify({
				status: 'Error',
				message: 'Unauthorized'
			}),
			{ status: 401 }
		);
	}

	try {
		const db = await clientPromise();

		// Get query parameters with defaults
		const startDate =
			url.searchParams.get('startDate') ||
			new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
		const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
		const pondId = url.searchParams.get('pondId');
		const speciesId = url.searchParams.get('speciesId');
		const type = url.searchParams.get('type') || 'daily';

		// Base match conditions for date range
		const dateMatch = {
			createdAt: {
				$gte: new Date(startDate),
				$lte: new Date(endDate)
			}
		};

		// Fetch feeds data
		const feedsPipeline = [
			{ $match: dateMatch },
			{
				$lookup: {
					from: 'stockings',
					localField: 'stockingId',
					foreignField: '_id',
					as: 'stocking'
				}
			},
			{ $unwind: '$stocking' }
		];

		if (pondId) {
			feedsPipeline.push({ $match: { 'stocking.pondId': pondId } });
		}
		if (speciesId) {
			feedsPipeline.push({ $match: { 'stocking.speciesId': speciesId } });
		}

		// Group by date and schedule
		feedsPipeline.push({
			$group: {
				_id: {
					date:
						type === 'monthly'
							? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
							: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
					schedule: '$schedule'
				},
				morningFeed: {
					$sum: {
						$cond: [{ $eq: ['$schedule', 'Morning'] }, '$quantity', 0]
					}
				},
				afternoonFeed: {
					$sum: {
						$cond: [{ $eq: ['$schedule', 'Afternoon'] }, '$quantity', 0]
					}
				}
			}
		});

		feedsPipeline.push({ $sort: { '_id.date': 1 } });

		const feeds = await db.collection('feeds').aggregate(feedsPipeline).toArray();

		// Fetch expenses data
		const expensesPipeline = [
			{ $match: dateMatch },
			{
				$lookup: {
					from: 'stockings',
					localField: 'stockingId',
					foreignField: '_id',
					as: 'stocking'
				}
			},
			{ $unwind: '$stocking' }
		];

		if (pondId) {
			expensesPipeline.push({ $match: { 'stocking.pondId': pondId } });
		}

		expensesPipeline.push({
			$group: {
				_id:
					type === 'monthly'
						? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
						: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				totalAmount: { $sum: '$amount' }
			}
		});

		expensesPipeline.push({ $sort: { _id: 1 } });

		const expenses = await db.collection('expenses').aggregate(expensesPipeline).toArray();

		// Fetch harvests data
		const harvestsPipeline = [
			{ $match: dateMatch },
			{
				$lookup: {
					from: 'stockings',
					localField: 'stockingId',
					foreignField: '_id',
					as: 'stocking'
				}
			},
			{ $unwind: '$stocking' }
		];

		if (pondId) {
			harvestsPipeline.push({ $match: { 'stocking.pondId': pondId } });
		}
		if (speciesId) {
			harvestsPipeline.push({ $match: { 'stocking.speciesId': speciesId } });
		}

		harvestsPipeline.push({ $sort: { harvestDate: 1 } });

		const harvests = await db.collection('harvests').aggregate(harvestsPipeline).toArray();

		return json({
			status: 'Success',
			data: {
				feeds: feeds.map((f) => ({
					_id: { date: f._id.date },
					morningFeed: f.morningFeed,
					afternoonFeed: f.afternoonFeed
				})),
				expenses: expenses.map((e) => ({
					_id: { date: e._id },
					totalAmount: e.totalAmount
				})),
				harvests: harvests.map((h) => ({
					harvestDate: h.harvestDate,
					revenue: h.revenue,
					totalExpenses: h.totalExpenses,
					survivalRate: h.survivalRate
				}))
			}
		});
	} catch (error) {
		console.error('Error fetching chart data:', error);
		return json(
			{
				status: 'Error',
				message: error.message
			},
			{ status: 500 }
		);
	}
};
