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

	let harvests = [];
	let stocks = [];
	try {
		let res = await fetch('/api/admin/harvest', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		let result = await res.json();
		harvests = result.response;

		res = await fetch('/api/admin/stocking', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		result = await res.json();
		stocks = result.response;
	} catch (error) {
		console.error('error', error);
	}

	return { harvests, stocks, user: locals.user };
};
