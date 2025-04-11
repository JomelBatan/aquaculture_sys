import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ request }: any) => {
	try {
		const db = await clientPromise();
		const Stocking = db.collection('stockings');

		const pipeline = [
			{
				$lookup: {
					from: 'ponds',
					localField: 'pondId',
					foreignField: '_id',
					as: 'pond'
				}
			},
			{
				$unwind: {
					path: '$pond',
					preserveNullAndEmptyArrays: true
				}
			}
		];
		const response = await Stocking.aggregate(pipeline).sort({ createdAt: -1 }).toArray();

		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				status: 'Error',
				message: error.message
			}),
			{ status: 500 }
		);
	}
};
