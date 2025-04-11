import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	try {
		const formData = await request.formData();
		const db = await clientPromise();
		const Expense = db.collection('expenses');

		const expenseData = {
			_id: id(),
			date: formData.get('date'),
			description: formData.get('description'),
			amount: Number.parseFloat(formData.get('amount')),
			stockingId: formData.get('stockingId'),
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: locals.user._id,
			updatedBy: locals.user._id,
			isActive: true
		};

		const response = await Expense.insertOne(expenseData);

		return new Response(
			JSON.stringify({
				status: 'Success',
				message: 'Data inserted successfully',
				response
			})
		);
	} catch (error) {
		console.error('Error:', error); // Add this for better debugging
		return new Response(
			JSON.stringify({
				status: 'Error',
				message: error.message
			}),
			{ status: 500 }
		);
	}
};
