import { CONSTANTS } from "@/constants";
import { AIConfig } from "@/types/ai/eliza/character";

export const fetcher = async ({
    url,
    method,
    body,
    headers,
}: {
    url: string;
    method?: "GET" | "POST" | "DELETE";
    body?: object | FormData;
    headers?: HeadersInit;
}) => {
    const options: RequestInit = {
        method: method ?? "GET",
        headers: headers
            ? headers
            : {
                  Accept: "application/json",
                  "Content-Type": "application/json",
              },
    };

    if (method === "POST") {
        if (body instanceof FormData) {
            if (options.headers && typeof options.headers === "object") {
                // Create new headers object without Content-Type
                options.headers = Object.fromEntries(
                    Object.entries(
                        options.headers as Record<string, string>
                    ).filter(([key]) => key !== "Content-Type")
                );
            }
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
    }

    return fetch(`${CONSTANTS.ELIZA_BASE_URL}${url}`, options).then(
        async (resp) => {
            const contentType = resp.headers.get("Content-Type");
            if (contentType === "audio/mpeg") {
                return await resp.blob();
            }

            if (!resp.ok) {
                const errorText = await resp.text();
                console.error("Error: ", errorText);

                let errorMessage = "An error occurred.";
                try {
                    const errorObj = JSON.parse(errorText);
                    errorMessage = errorObj.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }

                throw new Error(errorMessage);
            }

            return resp.json();
        }
    );
};

export const elizaClient = {
    sendMessage: (
        agentId: string,
        message: string,
        selectedFile?: File | null
    ) => {
        const formData = new FormData();
        formData.append("text", message);
        formData.append("user", "user");

        if (selectedFile) {
            formData.append("file", selectedFile);
        }
        return fetcher({
            url: `/${agentId}/message`,
            method: "POST",
            body: formData,
        });
    },
    getAgents: () => fetcher({ url: "/agents" }),
    getAgent: (agentId: string): Promise<{ id: string; character: AIConfig }> =>
        fetcher({ url: `/agents/${agentId}` }),
    tts: (agentId: string, text: string) =>
        fetcher({
            url: `/${agentId}/tts`,
            method: "POST",
            body: {
                text,
            },
            headers: {
                "Content-Type": "application/json",
                Accept: "audio/mpeg",
                "Transfer-Encoding": "chunked",
            },
        }),
    whisper: async (agentId: string, audioBlob: Blob) => {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");
        return fetcher({
            url: `/${agentId}/whisper`,
            method: "POST",
            body: formData,
        });
    },
    saveConfig: async (config: AIConfig) => {
        try {
            const response = await fetcher({
                url: "/agent/start",
                method: "POST",
                body: { characterJson: config },
            });
            console.log("Config saved successfully:", response);
        } catch (error) {
            console.error("Failed to save config:", error);
        }
    },

    updateConfig: async (config: AIConfig, agentId: string) => {
        try {
            const deleteResponse = await fetch(
                `${CONSTANTS.ELIZA_BASE_URL}/agents/${agentId}`,
                { method: "DELETE" }
            );

            if (!deleteResponse.ok) {
                throw new Error(
                    `Failed to delete agent: ${deleteResponse.status} ${deleteResponse.statusText}`
                );
            }
            console.log("Agent deleted successfully");

            console.log("Starting new agent with updated config...");
            const response = await fetcher({
                url: "/agent/start",
                method: "POST",
                body: { characterJson: config },
            });
            console.log("Agent restarted successfully:", response);
            alert("Configuration updated and agent restarted successfully!");
        } catch (error) {
            console.error("Failed to update config:", error);
            alert("Failed to update configuration.");
        }
    },
};
