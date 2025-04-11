import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ request }: any) => {
	const db = await clientPromise();
	const Species = db.collection('species');

	const response = await Species.find({ isActive: true }).sort({ createdAt: -1 }).toArray();

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
};
