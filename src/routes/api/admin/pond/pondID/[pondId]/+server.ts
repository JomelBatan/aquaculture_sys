import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ params }: any) => {
	try {
		const pondId = decodeURIComponent(params.pondId);
		const db = await clientPromise();
		const Pond = db.collection('ponds');

		const pipeline = [
			{ $match: { _id: pondId } },
			{
				$lookup: {
					from: 'stockings',
					localField: '_id',
					foreignField: 'pondId',
					as: 'stockings'
				}
			},
			{
				$addFields: {
					stockings: {
						$cond: {
							if: { $eq: [{ $size: '$stockings' }, 0] },
							then: [],
							else: {
								$filter: {
									input: '$stockings',
									as: 'stocking',
									cond: { $eq: ['$$stocking.isActive', true] }
								}
							}
						}
					}
				}
			},
			{
				$lookup: {
					from: 'species',
					localField: 'stockings.speciesId',
					foreignField: '_id',
					as: 'speciesLookup'
				}
			},
			{
				$addFields: {
					stockings: {
						$cond: {
							if: { $eq: [{ $size: '$stockings' }, 0] },
							then: [],
							else: {
								$map: {
									input: '$stockings',
									as: 'stocking',
									in: {
										$mergeObjects: [
											'$$stocking',
											{
												species: {
													$arrayElemAt: [
														{
															$filter: {
																input: '$speciesLookup',
																as: 'species',
																cond: { $eq: ['$$species._id', '$$stocking.speciesId'] }
															}
														},
														0
													]
												}
											}
										]
									}
								}
							}
						}
					}
				}
			},
			{
				$project: {
					speciesLookup: 0
				}
			},
			{ $sort: { createdAt: -1 } }
		];
		const response = await Pond.aggregate(pipeline).toArray();
		return new Response(
			JSON.stringify({
				status: 'Success',
				response: response || []
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
