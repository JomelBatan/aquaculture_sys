import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	const data = await request.json();
	const db = await clientPromise();
	const Expense = db.collection('expenses');

	const expenseUpdate = {
		$set: {
			updatedAt: new Date(),
			description: data.description,
			amount: data.amount,
			stockingId: data.stockingId,
			updatedBy: locals.user._id
		}
	};

	const response = await Expense.updateOne({ _id: data._id }, expenseUpdate);

	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Expenses updated successfully',
				response
			})
		);
	}
};
