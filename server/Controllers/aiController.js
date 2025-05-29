const path = '../deepseek.ai.mjs';  // chemin relatif

async function generateTitleOrDescription(req, res) {
    try {
        const { input, type } = req.body;
        if (!input || !['title', 'description'].includes(type)) {
            return res.status(400).json({ message: "Paramètres invalides" });
        }

        const deepseek = await import(path);
        const generated = await deepseek.generateTitleOrDescription(input, type);

        res.status(200).json({ generated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message || err });
    }
}
// Example usage of chatWithPrompt
async function chatWithPromptHandler(req, res) {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: "Le prompt est requis." });
        }

        const deepseek = await import(path);
        const response = await deepseek.chatWithPrompt(prompt);

        res.status(200).json({ response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message || err });
    }
}

module.exports = { generateTitleOrDescription, chatWithPromptHandler };
