import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Species = db.collection('species');

	const speciesUpdate = {
		$set: {
			updatedAt: new Date(),
			name: data.name,
			type: data.type,
			optimumTemperature: data.optimumTemperature,
			optimumpH: data.optimumpH,
			updatedBy: locals.user._id
		}
	};

	const response = await Species.updateOne({ _id: data._id }, speciesUpdate);

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Species updated successfully',
				response
			})
		);
	}
};
