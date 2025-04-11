import clientPromise from '$lib/server/mongo';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const { stockId } = params;
	const db = await clientPromise();
	const Stocking = db.collection('stockings');

	const pipeline = [
		{
			$match: { _id: stockId }
		},
		{
			$lookup: {
				from: 'expenses',
				localField: '_id',
				foreignField: 'stockingId',
				as: 'expenses'
			}
		},
		{
			$lookup: {
				from: 'species',
				localField: 'speciesId',
				foreignField: '_id',
				as: 'species'
			}
		},
		{
			$unwind: {
				path: '$species',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 'users',
				localField: 'createdBy',
				foreignField: '_id',
				as: 'createdBy'
			}
		},
		{
			$unwind: {
				path: '$createdBy',
				preserveNullAndEmptyArrays: true
			}
		}
	];

	const [stockDetail] = await Stocking.aggregate(pipeline).toArray();
	return { stockDetail };
}
