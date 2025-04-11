import clientPromise from '$lib/server/mongo';
import type { RequestHandler } from '../$types';

/** @type {import('./$types').RequestHandler} */

export const GET: RequestHandler = async () => {
	const db = await clientPromise();
	const Ponds = db.collection('ponds');

	const pipeline = [
		{ $match: { isActive: true } },
		{
			$group: {
				_id: '$location', // Group by location
				ponds: { $push: '$$ROOT' } // Store all ponds under each location
			}
		},
		{
			$project: {
				_id: 1 // Only return the location (_id) field
			}
		},
		{ $sort: { _id: 1 } } // Sort by location
	];

	try {
		const response = await Ponds.aggregate(pipeline).toArray();

		// Extract just the _id values from the grouped results
		const locations = response.map((item) => item._id);

		return new Response(
			JSON.stringify({
				status: 'Success',
				response: locations || [] // Return only the array of location names (_id)
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error during aggregation:', error); // Log the error for debugging
		return new Response(
			JSON.stringify({
				status: 'Error',
				message: 'Failed to compare and combine ponds by location',
				error: error.message || 'Unknown error'
			}),
			{ status: 500 }
		);
	}
};
