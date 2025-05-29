import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-V3-0324";

const client = ModelClient(endpoint, new AzureKeyCredential(token));

export async function generateTitleOrDescription(input, type) {
    if (!input || !['title', 'description'].includes(type)) {
        throw new Error("Paramètres invalides");
    }

    const userPrompt = type === "title"
        ? `Génère uniquement un titre clair et court pour cette description : "${input}". Donne-moi uniquement le titre, rien d'autre.`
        : `Génère uniquement une description claire et complète pour ce titre : "${input}". Donne-moi uniquement la description, rien d'autre.`;

    try {
        const response = await Promise.race([
            client.path("/chat/completions").post({
                body: {
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.7,
                    top_p: 1.0,
                    max_tokens: 300,
                    model: model
                }
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 30000) // Timeout après 30 secondes
            )
        ]);

        if (isUnexpected(response)) {
            throw response.body.error;
        }

        const fullText = response.body.choices[0].message.content.trim();
        const firstLine = fullText.split('\n')[0].replace(/^Titre\s*:\s*|^Description\s*:\s*/i, '').trim();
        return firstLine;

    } catch (err) {
        throw new Error('La génération a échoué ou a pris trop de temps.');
    }
}
export async function chatWithPrompt(prompt) {
    if (!prompt) {
        throw new Error("Le prompt est requis.");
    }

    try {
        const response = await Promise.race([
            client.path("/chat/completions").post({
                body: {
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    top_p: 1.0,
                    max_tokens: 300,
                    model: model
                }
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 60000) // Timeout après 30 secondes
            )
        ]);

        if (isUnexpected(response)) {
            throw response.body.error;
        }

        return response.body.choices[0].message.content.trim();
    } catch (err) {
        console.error('Erreur lors de la requête :', err);
        throw new Error('La requête de chat a échoué ou a pris trop de temps.');
    }
}
