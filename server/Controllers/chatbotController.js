const chatbotService = require('../services/chatbotService');

const processQuery = async (req, res) => {
    try {
        const { query } = req.body;
        const userId = req.user._id;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez poser une question valide'
            });
        }

        const startTime = Date.now();
        console.log(`Processing query for user ${userId}: ${query}`);
        const response = await chatbotService.processQuery(userId, query.trim());
        const processingTime = Date.now() - startTime;

        res.status(200).json({
            success: true,
            data: response,
            processingTime: `${processingTime}ms`
        });

    } catch (error) {
        console.error('Erreur chatbot:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur de traitement de votre question',
            error: error.message,
            fallbackResponse: await chatbotService.getFallbackResponse(req.user._id)
        });
    }
};

module.exports = {
    processQuery
};