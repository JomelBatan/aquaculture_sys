import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ request }: any) => {
	const db = await clientPromise();
	const Harvest = db.collection('harvests');

	const pipeline = [
		{
			$lookup: {
				from: 'stockings',
				localField: 'stockingId',
				foreignField: '_id',
				as: 'stocking'
			}
		},
		{
			$unwind: '$stocking'
		},
		{
			$lookup: {
				from: 'ponds',
				localField: 'stocking.pondId',
				foreignField: '_id',
				as: 'pond'
			}
		},
		{
			$unwind: '$pond'
		},
		{
			$lookup: {
				from: 'species',
				localField: 'stocking.speciesId',
				foreignField: '_id',
				as: 'species'
			}
		},
		{ $unwind: '$species' },
		{ $sort: { createdAt: -1 } }
	];
	const response = await Harvest.aggregate(pipeline).toArray();

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
};
