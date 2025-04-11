import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Harvest = db.collection('harvests');

	data._id = id();
	data.createdAt = new Date();
	data.updatedAt = new Date();
	data.createdBy = locals.user._id;
	data.updatedBy = locals.user._id;
	data.isActive = true;

	const response = await Harvest.insertOne(data);
	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Data inserted successfully',
				response
			})
		);
	}
};
