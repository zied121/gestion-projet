const ModelClient = require("@azure-rest/ai-inference").default;
const { isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const Utilisateur = require('../models/Usermodel');

class ChatbotService {
    constructor() {
        this.token = process.env.GITHUB_TOKEN || "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";
        this.endpoint = "https://models.github.ai/inference";
        this.model = "deepseek/DeepSeek-V3-0324";
        
        this.client = ModelClient(
            this.endpoint,
            new AzureKeyCredential(this.token)
        );
    }

    async processQuery(userId, query) {
        try {
            // Get comprehensive user data for context
            const userData = await this.getUserData(userId);
            
            // Create detailed system prompt with all user data
            const systemPrompt = this.buildIntelligentSystemPrompt(userData);
            
            // Call AI model with full context
            const response = await this.client.path("/chat/completions").post({
                body: {
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: query }
                    ],
                    temperature: 0.7,
                    top_p: 0.9,
                    max_tokens: 1500,
                    model: this.model
                }
            });

            if (isUnexpected(response)) {
                throw new Error(`API Error: ${response.body.error?.message || 'Unknown error'}`);
            }

            const aiResponse = response.body.choices[0].message.content;
            return { message: aiResponse };

        } catch (error) {
            console.error('Erreur dans le traitement de la requête:', error);
            return {
                message: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer."
            };
        }
    }

    async getUserData(userId) {
        try {
            // Get user info
            const user = await Utilisateur.User.findById(userId).select('nom prenom email');
            
            // Get current date info
            const now = new Date();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            const nextMonth = new Date(now);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            // Get user's participating event IDs
            const participatingEventIds = await this.getUserParticipatingEventIds(userId);

            // Get all types of events with details
            const [
                todayEvents,
                upcomingEvents,
                pastEvents,
                organizerEvents,
                participantEvents,
                upcomingHolidays,
                allEventTypes,
                recentParticipants
            ] = await Promise.all([
                // Today's events
                Event.find({
                    $or: [
                        { organisateur_id: userId },
                        { _id: { $in: participatingEventIds } }
                    ],
                    date_debut: { $gte: today, $lt: tomorrow }
                }).populate('organisateur_id', 'nom prenom').sort({ date_debut: 1 }),

                // Upcoming events (next 30 days)
                Event.find({
                    $or: [
                        { organisateur_id: userId },
                        { _id: { $in: participatingEventIds } }
                    ],
                    date_debut: { $gt: now, $lt: nextMonth }
                }).populate('organisateur_id', 'nom prenom').sort({ date_debut: 1 }),

                // Recent past events (last 7 days)
                Event.find({
                    $or: [
                        { organisateur_id: userId },
                        { _id: { $in: participatingEventIds } }
                    ],
                    date_debut: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), $lt: now }
                }).populate('organisateur_id', 'nom prenom').sort({ date_debut: -1 }),

                // Events organized by user
                Event.find({ organisateur_id: userId })
                    .populate('organisateur_id', 'nom prenom')
                    .sort({ date_debut: -1 })
                    .limit(10),

                // Events user participates in
                Event.find({ _id: { $in: participatingEventIds } })
                    .populate('organisateur_id', 'nom prenom')
                    .sort({ date_debut: -1 })
                    .limit(10),

                // Upcoming holidays
                Event.find({
                    type: 'Holiday',
                    date_debut: { $gt: now }
                }).sort({ date_debut: 1 }).limit(5),

                // Get unique event types
                Event.distinct('type'),

                // Recent participants for user's events
                this.getRecentParticipants(userId)
            ]);

            return {
                user,
                currentDateTime: now,
                todayEvents,
                upcomingEvents,
                pastEvents,
                organizerEvents,
                participantEvents,
                upcomingHolidays,
                allEventTypes,
                recentParticipants,
                statistics: {
                    totalUpcomingEvents: upcomingEvents.length,
                    todayEventsCount: todayEvents.length,
                    organizerEventsCount: organizerEvents.length,
                    participantEventsCount: participantEvents.length
                }
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
            return null;
        }
    }

    buildIntelligentSystemPrompt(userData) {
        if (!userData) {
            return "Tu es un assistant personnel pour la gestion d'événements. Les données utilisateur ne sont pas disponibles actuellement.";
        }

        const { user, currentDateTime, todayEvents, upcomingEvents, pastEvents, organizerEvents, participantEvents, upcomingHolidays, allEventTypes, recentParticipants, statistics } = userData;

        // Format events for context
        const formatEvent = (event) => {
            const isOrganizer = event.organisateur_id?._id?.toString() === user._id?.toString();
            return `- ${event.titre} (${event.type}) - ${event.date_debut.toLocaleString('fr-FR')} ${isOrganizer ? '[Organisateur]' : '[Participant]'}${event.description ? ` - ${event.description}` : ''}`;
        };

        const formatParticipant = (p) => {
            return `- ${p.participant.nom} (${p.participant.email}) - ${p.reponse} pour "${p.event.titre}"`;
        };

        return `Tu es un assistant personnel intelligent spécialisé dans la gestion d'événements et de calendrier.

INFORMATIONS UTILISATEUR:
- Nom: ${user.nom} ${user.prenom}
- Email: ${user.email}
- Date/Heure actuelle: ${currentDateTime.toLocaleString('fr-FR')}

STATISTIQUES:
- Événements aujourd'hui: ${statistics.todayEventsCount}
- Événements à venir: ${statistics.totalUpcomingEvents}
- Événements que vous organisez: ${statistics.organizerEventsCount}
- Événements auxquels vous participez: ${statistics.participantEventsCount}

ÉVÉNEMENTS D'AUJOURD'HUI (${todayEvents.length}):
${todayEvents.length > 0 ? todayEvents.map(formatEvent).join('\n') : 'Aucun événement aujourd\'hui'}

PROCHAINS ÉVÉNEMENTS (${upcomingEvents.length}):
${upcomingEvents.length > 0 ? upcomingEvents.slice(0, 10).map(formatEvent).join('\n') : 'Aucun événement à venir'}

ÉVÉNEMENTS RÉCENTS (${pastEvents.length}):
${pastEvents.length > 0 ? pastEvents.slice(0, 5).map(formatEvent).join('\n') : 'Aucun événement récent'}

JOURS FÉRIÉS À VENIR:
${upcomingHolidays.length > 0 ? upcomingHolidays.map(h => `- ${h.titre} - ${h.date_debut.toLocaleDateString('fr-FR')}${h.description ? ` - ${h.description}` : ''}`).join('\n') : 'Aucun jour férié programmé'}

TYPES D'ÉVÉNEMENTS DISPONIBLES:
${allEventTypes.join(', ')}

PARTICIPANTS RÉCENTS:
${recentParticipants.length > 0 ? recentParticipants.slice(0, 10).map(formatParticipant).join('\n') : 'Aucun participant récent'}

INSTRUCTIONS:
1. Réponds en français de manière naturelle et conversationnelle
2. Utilise les informations ci-dessus pour répondre aux questions sur les événements, réunions, tâches, jours fériés, participants, etc.
3. Tu peux faire des analyses, des résumés, des comparaisons, et donner des recommandations
4. Si l'utilisateur demande des détails sur un événement spécifique, utilise les informations disponibles
5. Tu peux compter, filtrer, trier et analyser les événements selon les critères demandés
6. Sois proactif en suggérant des informations pertinentes
7. Si une information n'est pas disponible dans le contexte, dis-le clairement
8. Tu peux répondre à des questions sur:
   - Nombre d'événements (aujourd'hui, cette semaine, ce mois)
   - Détails d'événements spécifiques
   - Comparaisons temporelles
   - Participants et leurs réponses
   - Jours fériés et dates importantes
   - Types d'événements
   - Recommandations de planification
   - Analyse de charge de travail
   - Conflits potentiels d'horaires

EXEMPLES DE QUESTIONS QUE TU PEUX TRAITER:
- "Combien de réunions ai-je cette semaine ?"
- "Quels sont mes événements les plus importants ?"
- "Qui a répondu à mon invitation pour la réunion X ?"
- "Quand est le prochain jour férié ?"
- "Compare ma charge de travail de cette semaine avec la semaine prochaine"
- "Quels participants sont les plus actifs ?"
- "Y a-t-il des conflits dans mon planning ?"
- "Résume mes événements du mois"

Réponds toujours de manière utile, précise et personnalisée en utilisant les données contextuelles.`;
    }

    async getRecentParticipants(userId) {
        try {
            const participants = await Participant.find({})
                .populate({
                    path: 'event_id',
                    match: { organisateur_id: userId },
                    select: 'titre date_debut'
                })
                .populate('id_participant', 'nom email')
                .sort({ _id: -1 })
                .limit(20);

            return participants
                .filter(p => p.event_id) // Only keep participants where event_id populated (user is organizer)
                .map(p => ({
                    participant: p.id_participant,
                    event: p.event_id,
                    reponse: p.reponse
                }));
        } catch (error) {
            console.error('Erreur lors de la récupération des participants:', error);
            return [];
        }
    }

    async getUserParticipatingEventIds(userId) {
        try {
            const participations = await Participant.find({ id_participant: userId });
            return participations.map(p => p.event_id);
        } catch (error) {
            console.error('Erreur lors de la récupération des IDs d\'événements:', error);
            return [];
        }
    }
}

module.exports = new ChatbotService();