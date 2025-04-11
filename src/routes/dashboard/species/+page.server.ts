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

	let species = [];
	try {
		const res = await fetch('/api/admin/species', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const result = await res.json();
		species = result.response;
	} catch (error) {
		console.error('error', error);
	}

	return { species, user: locals.user };
};
