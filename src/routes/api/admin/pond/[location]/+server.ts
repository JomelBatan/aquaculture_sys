import clientPromise from '$lib/server/mongo';
import type { RequestHandler } from '../$types';

/** @type {import('./$types').RequestHandler} */
export const GET: RequestHandler = async ({ params }: any) => {
	const location = decodeURIComponent(params.location);

	const db = await clientPromise();
	const Pond = db.collection('ponds');

	const pipeline = [
		{ $match: { isActive: true, location: location } },

		{
			$project: {
				_id: 1
			}
		},
		{ $sort: { createdAt: -1 } }
	];

	const response = await Pond.aggregate(pipeline).toArray();

	return new Response(
		JSON.stringify({
			status: 'Success',
			response: response || []
		})
	);
};
