type ExtraContentFields = {
	user: string;
	createdAt: number;
	isLoading?: boolean;
};

interface Content {
	/** The main text content */
	text: string;
	/** Optional action associated with the message */
	action?: string;
	/** Optional source/origin of the content */
	source?: string;
	/** URL of the original message/post (e.g. tweet URL, Discord message link) */
	url?: string;
}

export type ContentWithUser = Content & ExtraContentFields;
