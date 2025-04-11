import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ params }: any) => {
	try {
		const db = await clientPromise();
		const Stocking = db.collection('stockings');

		const activeStocking = await Stocking.findOne({
			pondId: params.pondId,
			isActive: true
			// You might want to add additional conditions here
			// For example, checking if the stocking is not harvested yet
		});

		return new Response(
			JSON.stringify({
				status: 'Success',
				hasActiveStocking: !!activeStocking
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
