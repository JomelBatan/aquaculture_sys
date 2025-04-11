import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ request }: any) => {
	const db = await clientPromise();
	const EnvironmentalCondition = db.collection('environmentalConditions');

	const response = await EnvironmentalCondition.find({ isActive: true })
		.sort({ createdAt: -1 })
		.toArray();

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
};
