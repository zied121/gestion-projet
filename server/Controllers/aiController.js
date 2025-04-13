const axios = require('axios');

const COHERE_API_KEY = process.env.COHERE_API_KEY;

const summarizeWithCohere = async (req, res) => {
    const { text } = req.body;

    if (!text || text.length < 20) {
        return res.status(400).json({ message: "Texte trop court à résumer" });
    }

    try {
        const response = await axios.post(
            'https://api.cohere.ai/v1/generate',
            {
                model: 'command',
                prompt: `Résume ce texte en une phrase concise :\n\n${text}`,
                max_tokens: 100,
                temperature: 0.3,
                k: 0,
                stop_sequences: ["--"],
                return_likelihoods: "NONE"
            },
            {
                headers: {
                    Authorization: `Bearer ${COHERE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const summary = response.data?.generations?.[0]?.text.trim() || 'Résumé non généré';
        res.status(200).json({ summary });

    } catch (error) {
        console.error('Erreur Cohere:', error.response?.data || error.message);
        res.status(500).json({ message: 'Erreur Cohere', error: error.message });
    }
};

module.exports = { summarizeWithCohere };
