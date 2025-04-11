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

	let ponds = [];
	try {
		const res = await fetch('/api/admin/pond', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const result = await res.json();
		ponds = result.response;
	} catch (error) {
		console.error('error', error);
	}

	return { ponds, user: locals.user };
};
