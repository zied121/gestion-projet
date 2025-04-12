const axios = require('axios');

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = 'mistralai/Mistral-7B-Instruct-v0.1'; // ou 'google/flan-t5-small'

const suggestTaskTitleHF = async (req, res) => {
    const { description } = req.body;

    if (!description) {
        return res.status(400).json({ message: "Description is required" });
    }

    try {
        const result = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL}`,
            {
                inputs: `Génère un titre clair pour cette tâche : ${description}`
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        const response = result.data;
        const title = response?.[0]?.generated_text || 'Titre non généré';
        res.status(200).json({ title });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ message: 'Erreur Hugging Face', error: error.message });
    }
};

module.exports = { suggestTaskTitleHF };
