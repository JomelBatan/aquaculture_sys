import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Supply = db.collection('supplies');

	const supplyUpdate = {
		$set: {
			updatedAt: new Date(),
			name: data.name,
			type: data.type,
			quantity: data.quantity,
			price: data.price,
			updatedBy: locals.user._id
		}
	};

	const response = await Supply.updateOne({ _id: data._id }, supplyUpdate);

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Supply updated successfully',
				response
			})
		);
	}
};
