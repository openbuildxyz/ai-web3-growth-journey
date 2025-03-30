export interface AIConfig {
    name: string;
    clients: string[];
    modelProvider: string;
    settings: {
        voice: {
            model: string;
        };
    };
    plugins: string[];
    bio: string[];
    lore: string[];
    messageExamples: MessageExampleGroup[][];
    postExamples: string[];
    topics: string[];
    style: {
        all: string[];
        chat: string[];
        post: string[];
    };
    adjectives: string[];
}

export interface MessageExampleGroup {
    user: string;
    content: {
        text: string;
    };
}
