export type User = {
	_id: string;
	fullName: string;
	email: string;
	role: string;
};

export type Species = {
	_id: string;
	name: string;
	type: string;
	optimumTemperature: string;
	optimumPH: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy: User;
	updatedBy: User;
	isActive: boolean;
};

export type Supplies = {
	_id: string;
	name: string;
	type: string;
	quantity: number;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
};

export type Feeding = {
	_id: string;
	pondId: string;
	stockingId: string;
	supplyId: string;
	feedingDate: Date;
	quantity: number;
	fcr: number;
	schedule: string;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
};
