import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
	try {
		const formData = await request.formData();
		const db = await clientPromise();
		const Species = db.collection('species');

		// Handle image upload
		let imagePath = null;
		const imageFile = formData.get('image');
		if (imageFile) {
			// Create uploads directory if it doesn't exist
			const uploadsDir = join(process.cwd(), 'static', 'uploads');
			if (!existsSync(uploadsDir)) {
				await mkdir(uploadsDir, { recursive: true });
			}

			const fileName = `${Date.now()}-${imageFile.name}`;
			const uploadPath = join(uploadsDir, fileName);
			const arrayBuffer = await imageFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			await writeFile(uploadPath, buffer);
			imagePath = `/uploads/${fileName}`;
		}

		const speciesData = {
			_id: id(),
			name: formData.get('name'),
			type: formData.get('type'),
			optimumTemperature: formData.get('optimumTemperature'),
			optimumpH: formData.get('optimumpH'),
			image: imagePath,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: locals.user._id,
			updatedBy: locals.user._id,
			isActive: true
		};

		const response = await Species.insertOne(speciesData);

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
