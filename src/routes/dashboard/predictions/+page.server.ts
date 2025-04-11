export const ssr = false;
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface Metrics {
	revenue: number;
	survivalRate: number;
	growthPeriod: number;
	fcr: number;
	waterQuality: number;
	temperature: number;
	expenses: number;
}

interface Prediction {
	pondLocation: string;
	month: number;
	season: string;
	metrics: Metrics;
	confidenceScore: number;
	riskScore: number;
}

interface PredictionData {
	predictions: Prediction[];
	seasonalAnalysis: Record<
		string,
		{
			avgRevenue: number;
			avgSurvivalRate: number;
			count: number;
		}
	>;
	recommendations: Array<{
		pondLocation: string;
		bestMonth: number;
		expectedRevenue: number;
		confidenceScore: number;
		riskScore: number;
		expenses: number;
	}>;
}

export const load = (async ({ locals, fetch }) => {
	// Simple auth check - if no session/user data exists, redirect to login
	if (!locals || Object.keys(locals).length === 0) {
		throw redirect(302, '/auth/login');
	}

	let predictionData: PredictionData = {
		predictions: [],
		seasonalAnalysis: {},
		recommendations: []
	};

	try {
		const res = await fetch('/api/admin/reports/prediction', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const result = await res.json();
		if (result.status === 'Success') {
			predictionData = result.data;
		}
	} catch (error) {
		console.error('error', error);
	}

	return { predictions: predictionData };
}) satisfies PageServerLoad;
