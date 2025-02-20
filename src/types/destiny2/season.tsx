export type Season = {
	displayProperties: {
		description: string;
		name: string;
		icon: string;
		hasIcon: boolean;
	};
	backgroundImagePath: string;
	seasonNumber: number;
	startDate: string;
	endDate: string;
	seasonPassHash: number;
	seasonPassProgressionHash: number;
	artifactItemHash: number;
	sealPresentationNodeHash: number;
	startTimeInSeconds: string;
	acts: {
		displayName: string;
		startTime: string;
		rankCount: number;
	}[];
	seasonalChallengesPresentationNodeHash: number;
	seasonPassUnlockHash: number;
	preview: {
		description: string;
		linkPath: string;
		images: {
			[key: string]: string;
		}[];
	};
	hash: number;
	index: number;
	redacted: boolean;
	blacklisted: boolean;
}