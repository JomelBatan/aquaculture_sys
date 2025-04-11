import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	try {
		const formData = await request.formData();
		const db = await clientPromise();
		const Supply = db.collection('supplies');

		const suppliesData = {
			_id: id(),
			name: formData.get('name'),
			type: formData.get('type'),
			quantity: formData.get('quantity'),
			price: Number.parseFloat(formData.get('price')),
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: locals.user._id,
			updatedBy: locals.user._id,
			isActive: true
		};

		const response = await Supply.insertOne(suppliesData);

		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Data inserted successfully',
				response
			})
		);
	} catch (error) {
		console.error('Error:', error);
		return new Response(
			JSON.stringify({
				status: 'Error',
				message: error.message
			}),
			{ status: 500 }
		);
	}
};
