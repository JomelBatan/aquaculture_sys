import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ request }: any) => {
	const db = await clientPromise();
	const Expense = db.collection('expenses');

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
		}
	];

	const response = await Expense.aggregate(pipeline).sort({ createdAt: -1 }).toArray();

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
};
