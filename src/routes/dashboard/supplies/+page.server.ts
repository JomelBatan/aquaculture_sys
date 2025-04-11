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

	let supplies = [];
	try {
		const res = await fetch('/api/admin/supply', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const result = await res.json();
		supplies = result.response;
	} catch (error) {
		console.error('error', error);
	}

	return { supplies, user: locals.user };
};
