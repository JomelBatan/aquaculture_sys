import clientPromise from '$lib/server/mongo';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const { pondId } = params;
	const db = await clientPromise();
	const Pond = db.collection('ponds');

	const pipeline = [
		{
			$match: { _id: pondId }
		},
		{
			$lookup: {
				from: 'stockings',
				localField: '_id',
				foreignField: 'pondId',
				as: 'stockings'
			}
		},
		{
			$unwind: {
				path: '$stockings',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 'species',
				localField: 'stockings.speciesId',
				foreignField: '_id',
				as: 'stockings.species'
			}
		},
		{
			$unwind: {
				path: '$stockings.species',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$group: {
				_id: '$_id',
				root: { $first: '$$ROOT' },
				stockings: { $push: '$stockings' }
			}
		},
		{
			$replaceRoot: {
				newRoot: {
					$mergeObjects: ['$root', { stockings: '$stockings' }]
				}
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

	const [pondDetail] = await Pond.aggregate(pipeline).toArray();
	return { pondDetail };
}
