import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	try {
		const data = await request.json();
		const db = await clientPromise();
		const Feed = db.collection('feeds');
		const Supply = db.collection('supplies');
		const Stocking = db.collection('stockings');

		// Check for active stocking for this pond
		const activeStocking = await Stocking.findOne({
			pondId: data.pondId,
			isActive: true
		});

		if (!activeStocking) {
			return new Response(
				JSON.stringify({
					status: 'Error',
					message: 'No active stocking found for this pond'
				}),
				{ status: 400 }
			);
		}

		// Check supply availability
		const supply = await Supply.findOne({ _id: data.supplyId });
		if (!supply) {
			return new Response(
				JSON.stringify({
					status: 'Error',
					message: 'Supply not found'
				}),
				{ status: 404 }
			);
		}

		// Check if there's enough quantity
		if (supply.quantity < data.quantity) {
			return new Response(
				JSON.stringify({
					status: 'Error',
					message: 'Insufficient supply quantity'
				}),
				{ status: 400 }
			);
		}

		// Add the active stocking ID to the feed data
		data._id = id();
		data.stockingId = activeStocking._id;
		data.createdAt = new Date();
		data.updatedAt = new Date();
		data.createdBy = locals.user._id;
		data.updatedBy = locals.user._id;
		data.isActive = true;

		// Insert feed record
		const feedResponse = await Feed.insertOne(data);

		if (feedResponse) {
			// Update supply quantity
			const supplyUpdate = await Supply.updateOne(
				{ _id: data.supplyId },
				{
					$set: {
						quantity: supply.quantity - data.quantity,
						updatedAt: new Date(),
						updatedBy: locals.user._id
					}
				}
			);

			if (!supplyUpdate.modifiedCount) {
				// If supply update fails, delete the feed record
				await Feed.deleteOne({ _id: data._id });
				return new Response(
					JSON.stringify({
						status: 'Error',
						message: 'Failed to update supply quantity'
					}),
					{ status: 500 }
				);
			}

			return new Response(
				JSON.stringify({
					status: 'Success',
					message: 'Feed data inserted and supply updated successfully',
					response: feedResponse
				})
			);
		}
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
