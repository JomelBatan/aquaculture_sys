import clientPromise from '$lib/server/mongo';
import { id } from '$lib/common/utils';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Pond = db.collection('ponds');

	const waterQualityData = {
		_id: id(),
		temperature: data.temperature,
		phLevel: data.phLevel,
		dissolvedOxygen: data.dissolvedOxygen,
		ammoniaLevel: data.ammoniaLevel,
		nitriteLevel: data.nitriteLevel,
		salinity: data.salinity,
		createdAt: new Date(),
		createdBy: locals.user._id
	};

	const response = await Pond.updateOne(
		{ _id: data.pondId },
		{
			$push: { water_quality: waterQualityData },
			$set: { updatedAt: new Date(), updatedBy: locals.user._id }
		}
	);

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Water quality updated successfully',
				response
			})
		);
	}
};
