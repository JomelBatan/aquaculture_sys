import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const WaterQuality = db.collection('waterQualities');

	data._id = id();
	data.createdAt = new Date();
	data.updatedAt = new Date();
	data.createdBy = locals.user._id;
	data.updatedBy = locals.user._id;
	data.isActive = true;

	const response = await WaterQuality.insertOne(data);
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
