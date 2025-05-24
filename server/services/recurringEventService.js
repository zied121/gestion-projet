// services/recurringEventService.js
const Event = require('../models/Event');

/**
 * Génère les dates d'occurrence pour un événement récurrent
 */
const generateRecurrenceDates = (startDate, endDate, recurrenceType, customDays = null, maxOccurrences = 52) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const eventEndDate = new Date(endDate);
    const eventDuration = eventEndDate.getTime() - new Date(startDate).getTime();
    
    // Limite pour éviter trop d'occurrences (par défaut 1 an)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    
    let occurrenceCount = 0;
    
    while (currentDate <= maxDate && occurrenceCount < maxOccurrences) {
        // Ajouter la date actuelle
        const occurrenceStart = new Date(currentDate);
        const occurrenceEnd = new Date(currentDate.getTime() + eventDuration);
        
        dates.push({
            date_debut: occurrenceStart,
            date_fin: occurrenceEnd
        });
        
        // Calculer la prochaine date selon le type de récurrence
        switch (recurrenceType) {
            case 'daily':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
                
            case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
                
            case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
                
            case 'yearly':
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
                
            case 'personnalise':
                if (customDays && customDays > 0) {
                    currentDate.setDate(currentDate.getDate() + customDays);
                } else {
                    break; // Sortir de la boucle si pas de valeur valide
                }
                break;
                
            default:
                return dates; // Retourner seulement la première occurrence
        }
        
        occurrenceCount++;
    }
    
    return dates;
};

/**
 * Crée les instances d'événements récurrents
 */
const createRecurringEventInstances = async (originalEvent) => {
    try {
        if (!originalEvent.isRecurring || originalEvent.type_recurrence === 'none') {
            return [originalEvent];
        }
        
        // Générer les dates de récurrence
        const recurrenceDates = generateRecurrenceDates(
            originalEvent.date_debut,
            originalEvent.date_fin,
            originalEvent.type_recurrence,
            originalEvent.custom_recurrence_days
        );
        
        const createdEvents = [];
        
        // Créer une instance pour chaque date de récurrence
        for (let i = 0; i < recurrenceDates.length; i++) {
            const { date_debut, date_fin } = recurrenceDates[i];
            
            // Pour la première occurrence, utiliser l'événement original
            if (i === 0) {
                originalEvent.date_debut = date_debut;
                originalEvent.date_fin = date_fin;
                originalEvent.recurrence_instance = i;
                originalEvent.parent_event_id = originalEvent._id;
                await originalEvent.save();
                createdEvents.push(originalEvent);
            } else {
                // Créer de nouvelles instances pour les autres occurrences
                const eventData = {
                    type: originalEvent.type,
                    titre: originalEvent.titre,
                    description: originalEvent.description,
                    fichier: originalEvent.fichier,
                    date_debut,
                    date_fin,
                    emplacement: originalEvent.emplacement,
                    lien: originalEvent.lien,
                    organisateur_id: originalEvent.organisateur_id,
                    projet_id: originalEvent.projet_id,
                    isRecurring: false, // Les instances ne sont pas récurrentes
                    type_recurrence: 'none',
                    rappel: originalEvent.rappel,
                    status: originalEvent.status,
                    participants: originalEvent.participants,
                    parent_event_id: originalEvent._id,
                    recurrence_instance: i
                };
                
                const recurringInstance = new Event(eventData);
                await recurringInstance.save();
                createdEvents.push(recurringInstance);
            }
        }
        
        return createdEvents;
    } catch (error) {
        console.error('Erreur lors de la création des instances récurrentes:', error);
        throw error;
    }
};

/**
 * Supprime toutes les instances d'un événement récurrent
 */
const deleteRecurringEventInstances = async (parentEventId) => {
    try {
        await Event.deleteMany({
            $or: [
                { _id: parentEventId },
                { parent_event_id: parentEventId }
            ]
        });
    } catch (error) {
        console.error('Erreur lors de la suppression des instances récurrentes:', error);
        throw error;
    }
};

/**
 * Met à jour toutes les instances d'un événement récurrent
 */
const updateRecurringEventInstances = async (parentEventId, updateData) => {
    try {
        // Exclure les champs qui ne doivent pas être mis à jour pour les instances
        const { date_debut, date_fin, isRecurring, type_recurrence, custom_recurrence_days, ...instanceUpdateData } = updateData;
        
        // Mettre à jour toutes les instances sauf les dates
        await Event.updateMany(
            { parent_event_id: parentEventId },
            { $set: instanceUpdateData }
        );
        
        // Mettre à jour l'événement parent
        await Event.findByIdAndUpdate(parentEventId, { $set: updateData });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des instances récurrentes:', error);
        throw error;
    }
};

module.exports = {
    generateRecurrenceDates,
    createRecurringEventInstances,
    deleteRecurringEventInstances,
    updateRecurringEventInstances
};