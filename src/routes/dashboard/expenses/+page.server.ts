export const ssr = false;
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({
	locals,
	fetch
}: {
	locals: { user?: any };
	fetch: typeof globalThis.fetch;
}): Promise<any> => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	let expenses = [];
	let stockings = [];

	try {
		// Fetch expenses
		const expensesRes = await fetch('/api/admin/expense', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const expensesResult = await expensesRes.json();
		expenses = expensesResult.response;

		// Fetch stockings for the dropdown
		const stockingsRes = await fetch('/api/admin/stocking', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const stockingsResult = await stockingsRes.json();
		stockings = stockingsResult.response;
	} catch (error) {
		console.error('error', error);
	}

	return { expenses, stockings, user: locals.user };
};
