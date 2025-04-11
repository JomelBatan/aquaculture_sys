import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DATABASE_URL;

// Constants for random selection
const ponds = ['Bailan Pontevedra, Capiz', 'Dayao, Roxas City, Capiz'];
const species = ['Tilapia', 'Catfish', 'Milkfish'];
const suppliers = [
	'Tateh Aquafeeds Surfer Starter',
	'Tateh Aquafeeds Surfer Starter',
	'Tateh Aquafeeds Surfer Starter'
];
const expenses = ['Labor', 'Maintenance', 'Medications', 'Water', 'Miscellaneous'];

const UNMISTAKABLE_CHARS = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';
const _randomString = (charsCount, alphabet) => {
	let result = '';
	for (let i = 0; i < charsCount; i++) {
		result += choice(alphabet);
	}
	return result;
};

const choice = (arrayOrString) => {
	const index = Math.floor(Math.random() * arrayOrString.length);
	if (typeof arrayOrString === 'string') {
		return arrayOrString.substr(index, 1);
	}
	return arrayOrString[index];
};

// Helper functions
function generateId(charsCount = 17) {
	// 17 characters is around 96 bits of entropy, which is the amount of
	// state in the Alea PRNG.
	if (charsCount === undefined) {
		charsCount = 17;
	}

	return _randomString(charsCount, UNMISTAKABLE_CHARS);
}

function randomInRange(min, max) {
	return Math.random() * (max - min) + min;
}

function addVariation(base, variationPercent) {
	const variation = base * (variationPercent / 100);
	return base + randomInRange(-variation, variation);
}

function getRandomItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Add these constants at the top with other constants
const expenseRates = {
	Labor: {
		base: 500, // Base daily labor cost
		variation: 20 // Percentage variation
	},
	Maintenance: {
		base: 300,
		variation: 30
	},
	Medications: {
		base: 200,
		variation: 40
	},
	Water: {
		base: 150,
		variation: 15
	},
	Miscellaneous: {
		base: 100,
		variation: 25
	}
};

// Add this function to calculate daily expenses
function calculateDailyExpenses(feedQuantity, supplyPrice, date) {
	const expenses = [];

	// Calculate feed expense
	const feedCost = feedQuantity * supplyPrice;
	expenses.push({
		description: 'Feed',
		amount: Math.round(feedCost)
	});

	// Randomly select 1-2 additional expense types for the day
	const otherExpenseTypes = ['Labor', 'Maintenance', 'Medications', 'Water', 'Miscellaneous'];
	const numExpenses = Math.floor(Math.random() * 2) + 1;
	const selectedExpenses = otherExpenseTypes.sort(() => 0.5 - Math.random()).slice(0, numExpenses);

	// Calculate other expenses
	selectedExpenses.forEach((expenseType) => {
		const rate = expenseRates[expenseType];
		const amount = addVariation(rate.base, rate.variation);
		expenses.push({
			description: expenseType,
			amount: Math.round(amount)
		});
	});

	return expenses;
}

// Generate data for a specific date
function generateDailyData(date) {
	// Environmental data with realistic ranges
	const environmental = {
		timestamp: date,
		waterTemperature: addVariation(25, 5),
		dissolvedOxygen: addVariation(7, 10),
		pH: addVariation(7.2, 3),
		ammonia: addVariation(0.05, 20),
		nitrate: addVariation(10, 15),
		turbidity: addVariation(5, 25)
	};

	const daysSinceStart = Math.floor(
		(date.getTime() - new Date('2023-01-01').getTime()) / (1000 * 60 * 60 * 24)
	);
	const growthStage = Math.min(daysSinceStart / 365, 1);

	const growth = {
		timestamp: date,
		averageWeight: addVariation(100 + 400 * growthStage, 10),
		growthRate: addVariation(2.5, 15),
		feedConversionRatio: addVariation(1.5, 10),
		biomass: addVariation(1000 + 4000 * growthStage, 10)
	};

	const health = {
		timestamp: date,
		mortalityRate: addVariation(0.1, 50),
		diseaseIncidents: Math.floor(randomInRange(0, 2)),
		behaviorScore: addVariation(8.5, 10),
		waterQualityHealthIndex: addVariation(9, 5)
	};

	const production = {
		timestamp: date,
		feedUsage: addVariation(50, 15),
		energyConsumption: addVariation(200, 20),
		waterUsage: addVariation(1000, 10),
		productionOutput: addVariation(45, 15),
		stockingDensity: addVariation(15, 5)
	};

	return {
		environmental,
		growth,
		health,
		production
	};
}

// Add these helper functions at the top with other helpers
function calculateHarvestMetrics(
	species,
	feeds,
	waterQuality,
	initialWeight,
	stockingDensity,
	totalExpenses
) {
	// Base metrics for different species
	const speciesMetrics = {
		Tilapia: {
			maxWeight: 500, // grams
			typicalSurvival: 85,
			pricePerKg: 120
		},
		Catfish: {
			maxWeight: 800,
			typicalSurvival: 80,
			pricePerKg: 150
		},
		Milkfish: {
			maxWeight: 400,
			typicalSurvival: 90,
			pricePerKg: 180
		}
	};

	const baseMetrics = speciesMetrics[species.name] || speciesMetrics['Tilapia'];

	// Calculate feed efficiency
	const totalFeed = feeds.reduce((sum, feed) => sum + feed.quantity, 0);
	const feedEfficiency = Math.min(1.2, totalFeed / (feeds.length * 2)); // Normalize against expected daily feed

	// Calculate water quality score (0-1)
	const optimalTemp = parseFloat(species.optimumTemperature.split('-')[0].replace('°C', ''));
	const optimalPH = parseFloat(species.optimumpH.split('-')[0]);

	const waterQualityScore =
		waterQuality.reduce((score, wq) => {
			const tempDiff = Math.abs(wq.temperature - optimalTemp) / optimalTemp;
			const phDiff = Math.abs(wq.phLevel - optimalPH) / optimalPH;
			const doScore = wq.dissolvedOxygen >= 5 ? 1 : wq.dissolvedOxygen / 5;

			return score + (1 - (tempDiff + phDiff) / 2) * doScore;
		}, 0) / waterQuality.length;

	// Calculate harvest metrics
	const growthMultiplier = feedEfficiency * waterQualityScore;

	const averageSize = addVariation(
		(baseMetrics.maxWeight * growthMultiplier + initialWeight) / 2,
		15
	);

	const survivalRate = addVariation(baseMetrics.typicalSurvival * waterQualityScore, 10);

	// Calculate total weight based on number of fish and average size
	const numberOfFish = stockingDensity * 1000; // Convert to actual number of fish (assuming stockingDensity is per m³)
	const survivingFish = numberOfFish * (survivalRate / 100);
	const totalWeight = addVariation(
		(survivingFish * averageSize) / 1000, // Convert from grams to kg
		10
	);

	// Calculate revenue based on market price and quality factors
	const qualityPriceAdjustment = waterQualityScore * 0.2; // Up to 20% price adjustment based on quality
	const adjustedPricePerKg = baseMetrics.pricePerKg * (1 + qualityPriceAdjustment);

	const grossRevenue = totalWeight * adjustedPricePerKg;
	// Ensure expenses don't completely eliminate revenue - assume max 70% expense ratio
	const maxExpenses = grossRevenue * 0.7;
	const netRevenue = Math.max(
		grossRevenue * 0.3,
		grossRevenue - Math.min(totalExpenses, maxExpenses)
	);

	return {
		totalWeight: Math.round(totalWeight),
		averageSize: Math.round(averageSize),
		survivalRate: Math.round(survivalRate),
		revenue: Math.round(netRevenue)
	};
}

// Modify the generateMockData function to use these calculations
function generateMockData(userId, startDate = new Date('2024-12-27')) {
	const pondId = generateId();
	const speciesId = generateId();
	const stockingId = generateId();
	const supplyId = generateId();

	const pond = {
		_id: pondId,
		size: 500,
		depth: 2.5,
		waterSource: 'freshwater',
		location: getRandomItem(ponds),
		createdAt: startDate,
		updatedAt: startDate,
		createdBy: userId,
		updatedBy: userId,
		isActive: true,
		water_quality: [
			{
				_id: generateId(),
				temperature: 28,
				phLevel: 7.5,
				dissolvedOxygen: 6,
				ammoniaLevel: 0.02,
				nitriteLevel: 10,
				salinity: 0,
				createdAt: startDate,
				createdBy: userId
			}
		]
	};

	const speciesData = {
		_id: speciesId,
		name: getRandomItem(species),
		type: 'Saltwater/Freshwater',
		optimumTemperature: '25°C - 30°C',
		optimumpH: '6.5 - 8.0',
		createdAt: startDate,
		updatedAt: startDate,
		createdBy: userId,
		updatedBy: userId,
		isActive: true
	};

	const stocking = {
		_id: stockingId,
		pondId: pondId,
		speciesId: speciesId,
		stockingDate: startDate.toISOString().split('T')[0],
		stockingDensity: 10,
		averageWeight: 50,
		supplier: getRandomItem(suppliers),
		createdAt: startDate,
		updatedAt: startDate,
		createdBy: userId,
		updatedBy: userId,
		isActive: true
	};

	const supply = {
		_id: supplyId,
		name: getRandomItem(suppliers),
		type: 'Commercial Pellets',
		quantity: 109,
		price: 27,
		createdAt: startDate,
		updatedAt: startDate,
		createdBy: userId,
		updatedBy: userId,
		isActive: true
	};

	const currentDate = new Date();
	const dailyData = [];
	let totalExpenses = 0;
	let currentDateIterator = new Date(startDate);

	// Track monthly expenses
	const monthlyExpensesDone = new Set();

	while (currentDateIterator <= currentDate) {
		const dateStr = currentDateIterator.toISOString().split('T')[0];
		const monthKey = `${currentDateIterator.getFullYear()}-${currentDateIterator.getMonth()}`;

		// Generate two feedings per day with descriptive schedules
		const feedingSchedules = [
			{ time: '08:00', schedule: 'Morning' },
			{ time: '16:00', schedule: 'Afternoon' }
		];

		for (const { time, schedule } of feedingSchedules) {
			const feedQuantity = addVariation(1, 15); // Halved the base quantity since we're feeding twice
			const feed = {
				_id: generateId(),
				pondId: pondId,
				supplyId: supplyId,
				feedingDate: dateStr,
				feedingTime: time,
				schedule: schedule, // Add schedule field
				quantity: feedQuantity,
				fcr: addVariation(1.5, 10),
				stockingId: stockingId,
				createdAt: new Date(currentDateIterator),
				updatedAt: new Date(currentDateIterator),
				createdBy: userId,
				updatedBy: userId,
				isActive: true
			};

			// Add feed expense for each feeding
			const feedExpense = {
				_id: generateId(),
				date: dateStr,
				description: `Feed (${schedule})`, // Use schedule in description
				amount: Math.round(feedQuantity * supply.price),
				stockingId: stockingId,
				createdAt: new Date(currentDateIterator),
				updatedAt: new Date(currentDateIterator),
				createdBy: userId,
				updatedBy: userId,
				isActive: true
			};
			totalExpenses += feedExpense.amount;
			dailyData.push({ feed, expense: feedExpense });
		}

		// Only calculate non-feed expenses 1-2 times per month
		if (!monthlyExpensesDone.has(monthKey) && Math.random() < 0.05) {
			const dailyExpenses = calculateDailyExpenses(
				dailyData.map((d) => d.feed.quantity)[0],
				supply.price,
				currentDateIterator
			);
			monthlyExpensesDone.add(monthKey);

			// Add each expense to the daily data with unique IDs
			for (const expenseData of dailyExpenses) {
				if (expenseData.description === 'Feed') continue; // Skip feed expenses here
				const expense = {
					_id: generateId(),
					date: dateStr,
					description: expenseData.description,
					amount: expenseData.amount * 15, // Multiply by ~15 days to make it monthly
					stockingId: stockingId,
					createdAt: new Date(currentDateIterator),
					updatedAt: new Date(currentDateIterator),
					createdBy: userId,
					updatedBy: userId,
					isActive: true
				};
				totalExpenses += expenseData.amount * 15;
				dailyData.push({
					feed: dailyData.find(
						(d) => d.feed.feedingDate === dateStr && d.feed.feedingTime === '08:00'
					).feed,
					expense
				});
			}
		}

		currentDateIterator.setDate(currentDateIterator.getDate() + 1);
	}

	// Calculate a random harvest date 4-6 months after stocking
	const harvestDate = new Date(startDate);
	const randomMonths = Math.floor(Math.random() * (6 - 4 + 1)) + 4; // Random number between 4 and 6
	harvestDate.setMonth(harvestDate.getMonth() + randomMonths);

	// Calculate harvest metrics with total expenses
	const harvestMetrics = calculateHarvestMetrics(
		speciesData,
		dailyData.map((d) => d.feed),
		pond.water_quality,
		stocking.averageWeight,
		stocking.stockingDensity,
		totalExpenses
	);

	const harvest = {
		_id: generateId(),
		harvestDate: harvestDate.toISOString().split('T')[0],
		totalWeight: harvestMetrics.totalWeight,
		averageSize: harvestMetrics.averageSize,
		survivalRate: harvestMetrics.survivalRate,
		revenue: harvestMetrics.revenue,
		remarks: 'None',
		stockingId: stockingId,
		createdAt: harvestDate,
		updatedAt: harvestDate,
		createdBy: userId,
		updatedBy: userId,
		isActive: true
	};

	return {
		pond,
		species: speciesData,
		stocking,
		supply,
		dailyData,
		harvest
	};
}

// Add this function to handle supply data
async function getOrCreateSupply(db, supplierName, userId) {
	// Check for existing supply
	const existingSupply = await db.collection('supplies').findOne({
		name: supplierName,
		isActive: true
	});

	if (existingSupply) {
		return existingSupply._id;
	}

	// Create new supply if none exists
	const newSupply = {
		_id: generateId(),
		name: supplierName,
		type: 'Commercial Pellets',
		quantity: addVariation(1000, 20), // Random initial quantity between 800-1200
		price: addVariation(27, 10), // Random price between 24-30
		createdAt: new Date(),
		updatedAt: new Date(),
		createdBy: userId,
		updatedBy: userId,
		isActive: true
	};

	await db.collection('supplies').insertOne(newSupply);
	console.log('New supply created:', supplierName);
	return newSupply._id;
}

// Modify generateAndInsertHistoricalData function
async function generateAndInsertHistoricalData() {
	const client = new MongoClient(uri);

	try {
		await client.connect();
		console.log('Connected to MongoDB');

		const db = client.db();
		const mockData = generateMockData('MpN6aXybTKKMF656J');

		// First, check and insert species
		const existingSpecies = await db.collection('species').findOne({ name: mockData.species.name });
		let speciesId;
		if (!existingSpecies) {
			const speciesResult = await db.collection('species').insertOne(mockData.species);
			speciesId = mockData.species._id;
			console.log('Species data inserted');
		} else {
			speciesId = existingSpecies._id;
			console.log('Using existing species');
		}

		// Check for existing pond
		const existingPond = await db.collection('ponds').findOne({ location: mockData.pond.location });
		let pondId;
		if (!existingPond) {
			const pondResult = await db.collection('ponds').insertOne(mockData.pond);
			pondId = mockData.pond._id;
			console.log('Pond data inserted');
		} else {
			pondId = existingPond._id;
			console.log('Using existing pond');
		}

		// Update stocking with correct IDs
		mockData.stocking.pondId = pondId;
		mockData.stocking.speciesId = speciesId;

		// Check for existing stocking
		const existingStocking = await db.collection('stockings').findOne({
			_id: mockData.stocking._id,
			pondId: pondId,
			stockingDate: mockData.stocking.stockingDate,
			isActive: true
		});
		let stockingId;
		if (!existingStocking) {
			const stockingResult = await db.collection('stockings').insertOne(mockData.stocking);
			stockingId = mockData.stocking._id;
			console.log('Stocking data inserted');
		} else {
			await db
				.collection('stockings')
				.updateOne({ _id: existingStocking._id }, { $set: { isActive: false } });
			stockingId = existingStocking._id;
			console.log('Using existing stocking');
		}

		// Update harvest with correct stocking ID
		mockData.harvest.stockingId = stockingId;

		// Check for existing harvest
		const existingHarvest = await db.collection('harvests').findOne({
			stockingId: stockingId
		});
		if (!existingHarvest) {
			await db.collection('harvests').insertOne(mockData.harvest);
			await db
				.collection('stockings')
				.updateOne({ _id: stockingId }, { $set: { isActive: false } });
			console.log('Harvest data inserted');
		} else {
			console.log('Harvest already exists for this stocking');
		}

		// Get or create supply for each supplier in the feeds
		const supplierName = getRandomItem(suppliers);
		const supplyId = await getOrCreateSupply(db, supplierName, mockData.stocking.createdBy);

		// Update daily data with correct IDs and insert
		for (const daily of mockData.dailyData) {
			const feedToInsert = {
				...daily.feed,
				pondId: pondId,
				stockingId: stockingId,
				supplyId: supplyId,
				_id: generateId()
			};

			const expenseToInsert = {
				...daily.expense,
				stockingId: stockingId,
				_id: generateId()
			};

			// Update supply quantity when feed is used
			await db.collection('supplies').updateOne(
				{ _id: supplyId },
				{
					$inc: { quantity: -feedToInsert.quantity },
					$set: { updatedAt: feedToInsert.createdAt }
				}
			);

			await db.collection('feeds').insertOne(feedToInsert);
			await db.collection('expenses').insertOne(expenseToInsert);
		}
		console.log('Daily data inserted with supply tracking');
	} catch (error) {
		console.error('Error:', error);
	} finally {
		await client.close();
		console.log('Disconnected from MongoDB');
	}
}

// Main function to insert mock data
async function insertMockData() {
	if (!uri) {
		console.error('DATABASE_URL not found in environment variables');
		process.exit(1);
	}

	try {
		await generateAndInsertHistoricalData();
		console.log('All mock data has been generated and inserted successfully');
	} catch (error) {
		console.error('Error generating mock data:', error);
	}
}

// Run the script
insertMockData().catch(console.error);
