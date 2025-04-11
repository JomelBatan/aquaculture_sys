import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { User } from '$lib/utils/types';
import clientPromise from '$lib/server/mongo';

type LoadResult = {
	user: User;
	chartData?: {
		feeds: any[];
		expenses: any[];
		harvests: any[];
		stockings: any[];
	};
};

export const ssr = false;

export const load: PageServerLoad = async ({
	locals,
	url
}: Parameters<PageServerLoad>[0]): Promise<LoadResult> => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Add authorization check for ADMINISTRATOR role
	if (locals.user.role !== 'ADMINISTRATOR') {
		throw redirect(302, '/unauthorized');
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
				totalQuantity: { $sum: '$quantity' }
			}
		});

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

		const expenses = await db.collection('expenses').aggregate(expensesPipeline).toArray();

		// Fetch harvests data with related information
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
			{
				$lookup: {
					from: 'species',
					localField: 'stocking.speciesId',
					foreignField: '_id',
					as: 'species'
				}
			},
			{ $unwind: '$species' }
		];

		if (pondId) {
			harvestsPipeline.push({ $match: { 'stocking.pondId': pondId } });
		}
		if (speciesId) {
			harvestsPipeline.push({ $match: { 'stocking.speciesId': speciesId } });
		}

		const harvests = await db.collection('harvests').aggregate(harvestsPipeline).toArray();

		// Fetch active stockings for filters
		const stockingsPipeline = [
			{
				$lookup: {
					from: 'ponds',
					localField: 'pondId',
					foreignField: '_id',
					as: 'pond'
				}
			},
			{ $unwind: '$pond' },
			{
				$lookup: {
					from: 'species',
					localField: 'speciesId',
					foreignField: '_id',
					as: 'species'
				}
			},
			{ $unwind: '$species' },
			{
				$group: {
					_id: {
						pondId: '$pondId',
						speciesId: '$speciesId'
					},
					pond: { $first: '$pond' },
					species: { $first: '$species' },
					pondId: { $first: '$pondId' },
					speciesId: { $first: '$speciesId' }
				}
			},
			{
				$sort: { 'pond.location': 1 }
			}
		];

		const stockings = await db.collection('stockings').aggregate(stockingsPipeline).toArray();

		return {
			user: locals.user as User,
			chartData: {
				feeds,
				expenses,
				harvests,
				stockings
			}
		};
	} catch (error) {
		console.error('Error loading chart data:', error);
		throw redirect(500, '/error');
	}
};
