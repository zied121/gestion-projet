const axios = require('axios');

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = 'gpt2';

const suggestTasks = async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: "Nom et description du projet sont requis." });
    }

    try {
        const prompt = `Basé sur le projet intitulé "${name}" avec la description suivante : "${description}", génère une liste de 5 tâches importantes sous forme de liste simple.`;

        const result = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL}`,
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        const generated = result?.data?.[0]?.generated_text || '';
        const tasks = generated
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(task => task.replace(/^[-*\d. ]*/, '').trim());

        res.status(200).json({ suggestedTasks: tasks });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ message: "Erreur lors de la suggestion de tâches.", error: error.message });
    }
};

module.exports = {
    suggestTasks
};




// const axios = require('axios');
//
// const COHERE_API_KEY = process.env.COHERE_API_KEY;
//
// const summarizeWithCohere = async (req, res) => {
//     const { text } = req.body;
//
//     if (!text || text.length < 20) {
//         return res.status(400).json({ message: "Texte trop court à résumer" });
//     }
//
//     try {
//         const response = await axios.post(
//             'https://api.cohere.ai/v1/generate',
//             {
//                 model: 'command',
//                 prompt: `Résume ce texte en une phrase concise :\n\n${text}`,
//                 max_tokens: 100,
//                 temperature: 0.3,
//                 k: 0,
//                 stop_sequences: ["--"],
//                 return_likelihoods: "NONE"
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${COHERE_API_KEY}`,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );
//
//         const summary = response.data?.generations?.[0]?.text.trim() || 'Résumé non généré';
//         res.status(200).json({ summary });
//
//     } catch (error) {
//         console.error('Erreur Cohere:', error.response?.data || error.message);
//         res.status(500).json({ message: 'Erreur Cohere', error: error.message });
//     }
// };
//
// module.exports = { summarizeWithCohere };
