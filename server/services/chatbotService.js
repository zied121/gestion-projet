const Event = require('../models/Event');
const Participant = require('../models/Participant');
const Utilisateur = require('../models/Usermodel');

class ChatbotService {
    async processQuery(userId, query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        try {
            // Meetings today
            if (normalizedQuery.includes('combien') && (normalizedQuery.includes('reunion') || normalizedQuery.includes('réunion'))) {
                return await this.countMeetingsToday(userId);
            }

            // Next event
            if (normalizedQuery.includes('prochain') && normalizedQuery.includes('evenement')) {
                return await this.getNextEvent(userId);
            }

            // Upcoming holidays
            if (normalizedQuery.includes('holiday') || normalizedQuery.includes('jour férié')) {
                return await this.getUpcomingHolidays();
            }

            // Participant responses
            if (normalizedQuery.includes('reponse') || normalizedQuery.includes('réponse')) {
                if (normalizedQuery.includes('participant')) {
                    return await this.getParticipantResponses(userId);
                }
            }

            // List participants
            if (normalizedQuery.includes('participant') && normalizedQuery.includes('liste')) {
                return await this.listEventParticipants(userId);
            }

            // Events by type
            if (normalizedQuery.includes('liste') || normalizedQuery.includes('affiche')) {
                if (normalizedQuery.includes('reunion') || normalizedQuery.includes('réunion')) {
                    return await this.getEventsByType(userId, 'Réunion');
                }
                if (normalizedQuery.includes('tache') || normalizedQuery.includes('tâche')) {
                    return await this.getEventsByType(userId, 'Tâche');
                }
            }

            return {
                message: "Je peux vous aider avec les questions suivantes :\n" +
                        "- Combien de réunions ai-je aujourd'hui ?\n" +
                        "- Quel est mon prochain événement ?\n" +
                        "- Quand est le prochain jour férié ?\n" +
                        "- Liste des participants à mes événements\n" +
                        "- Affiche mes réunions\n" +
                        "- Affiche mes tâches\n" +
                        "- Quelles sont les réponses des participants ?"
            };
        } catch (error) {
            console.error('Erreur dans le traitement de la requête:', error);
            return {
                message: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer."
            };
        }
    }

    async countMeetingsToday(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [organizerMeetings, participantMeetings] = await Promise.all([
            Event.countDocuments({
                type: 'Réunion',
                organisateur_id: userId,
                date_debut: { $gte: today, $lt: tomorrow }
            }),
            Participant.countDocuments({
                id_participant: userId,
                'event_id.type': 'Réunion',
                'event_id.date_debut': { $gte: today, $lt: tomorrow }
            })
        ]);

        const totalMeetings = organizerMeetings + participantMeetings;

        return {
            message: `Vous avez ${totalMeetings} réunion${totalMeetings > 1 ? 's' : ''} aujourd'hui.\n` +
                    `- ${organizerMeetings} en tant qu'organisateur${organizerMeetings > 1 ? 's' : ''}\n` +
                    `- ${participantMeetings} en tant que participant${participantMeetings > 1 ? 's' : ''}`
        };
    }

    async getNextEvent(userId) {
        const now = new Date();
        
        const nextEvent = await Event.findOne({
            $or: [
                { organisateur_id: userId },
                { _id: { $in: await this.getUserParticipatingEventIds(userId) } }
            ],
            date_debut: { $gt: now }
        })
        .sort({ date_debut: 1 })
        .populate('organisateur_id', 'nom prenom');

        if (!nextEvent) {
            return { message: "Vous n'avez aucun événement à venir." };
        }

        return {
            message: `Votre prochain événement est "${nextEvent.titre}" (${nextEvent.type})\n` +
                    `Date : ${nextEvent.date_debut.toLocaleString('fr-FR')}\n` +
                    `${nextEvent.organisateur_id?._id.toString() === userId.toString() ? 
                        'Vous êtes l\'organisateur' : 
                        `Organisé par : ${nextEvent.organisateur_id?.nom} ${nextEvent.organisateur_id?.prenom}`}`
        };
    }

    async getUpcomingHolidays() {
        const now = new Date();
        const nextHoliday = await Event.findOne({
            type: 'Holiday',
            date_debut: { $gt: now }
        })
        .sort({ date_debut: 1 });

        if (!nextHoliday) {
            return { message: "Il n'y a pas de jours fériés prévus prochainement." };
        }

        return {
            message: `Le prochain jour férié est "${nextHoliday.titre}"\n` +
                    `Date : ${nextHoliday.date_debut.toLocaleDateString('fr-FR')}\n` +
                    `Description : ${nextHoliday.description || 'Aucune description disponible'}`
        };
    }

    async getParticipantResponses(userId) {
        const events = await Event.find({
            organisateur_id: userId,
            type: { $in: ['Réunion', 'Événement'] }
        }).sort({ date_debut: -1 }).limit(5);

        if (!events.length) {
            return { message: "Vous n'avez pas d'événements avec des participants." };
        }

        let message = "Voici les réponses des participants pour vos 5 derniers événements :\n\n";

        for (const event of events) {
            const participants = await Participant.find({ event_id: event._id })
                .populate('id_participant', 'nom email');

            message += `${event.titre} (${event.date_debut.toLocaleDateString('fr-FR')}) :\n`;
            if (participants.length === 0) {
                message += "- Aucun participant\n";
            } else {
                for (const p of participants) {
                    message += `- ${p.id_participant.nom} : ${p.reponse}\n`;
                }
            }
            message += "\n";
        }

        return { message };
    }

    async listEventParticipants(userId) {
        const events = await Event.find({
            organisateur_id: userId,
            type: { $in: ['Réunion', 'Événement'] }
        }).sort({ date_debut: -1 }).limit(3);

        if (!events.length) {
            return { message: "Vous n'avez pas d'événements avec des participants." };
        }

        let message = "Liste des participants pour vos 3 derniers événements :\n\n";

        for (const event of events) {
            const participants = await Participant.find({ event_id: event._id })
                .populate('id_participant', 'nom email');

            message += `${event.titre} (${event.date_debut.toLocaleDateString('fr-FR')}) :\n`;
            if (participants.length === 0) {
                message += "- Aucun participant\n";
            } else {
                participants.forEach(p => {
                    message += `- ${p.id_participant.nom} (${p.id_participant.email})\n`;
                });
            }
            message += "\n";
        }

        return { message };
    }

    async getEventsByType(userId, type) {
        const now = new Date();
        const events = await Event.find({
            $or: [
                { organisateur_id: userId },
                { _id: { $in: await this.getUserParticipatingEventIds(userId) } }
            ],
            type: type,
            date_debut: { $gte: now }
        })
        .sort({ date_debut: 1 })
        .limit(5)
        .populate('organisateur_id', 'nom prenom');

        if (!events.length) {
            return { message: `Vous n'avez pas de ${type.toLowerCase()} à venir.` };
        }

        let message = `Vos prochains ${type.toLowerCase()}s :\n\n`;
        events.forEach(event => {
            message += `- ${event.titre}\n`;
            message += `  Date : ${event.date_debut.toLocaleString('fr-FR')}\n`;
            message += `  ${event.organisateur_id?._id.toString() === userId.toString() ? 
                'Vous êtes l\'organisateur' : 
                `Organisé par : ${event.organisateur_id?.nom} ${event.organisateur_id?.prenom}`}\n\n`;
        });

        return { message };
    }

    async getUserParticipatingEventIds(userId) {
        const participations = await Participant.find({ id_participant: userId });
        return participations.map(p => p.event_id);
    }

    async getFallbackResponse(userId) {
        const nextEvent = await this.getNextEvent(userId);
        return {
            message: "Je n'ai pas pu traiter votre demande, mais voici votre prochain événement :\n\n" +
                    nextEvent.message
        };
    }
}

module.exports = new ChatbotService();