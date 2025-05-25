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
 * NOUVELLE VERSION qui gère les changements de récurrence
 */
const updateRecurringEventInstances = async (parentEventId, updateData) => {
    try {
        console.log('Mise à jour des instances récurrentes pour:', parentEventId);
        console.log('Données de mise à jour:', updateData);

        // Récupérer l'événement parent actuel
        const parentEvent = await Event.findById(parentEventId);
        if (!parentEvent) {
            throw new Error('Événement parent non trouvé');
        }

        // Vérifier si la récurrence a changé
        const recurrenceChanged = 
            updateData.hasOwnProperty('isRecurring') && updateData.isRecurring !== parentEvent.isRecurring ||
            updateData.hasOwnProperty('type_recurrence') && updateData.type_recurrence !== parentEvent.type_recurrence ||
            updateData.hasOwnProperty('custom_recurrence_days') && updateData.custom_recurrence_days !== parentEvent.custom_recurrence_days;

        console.log('Récurrence changée:', recurrenceChanged);

        if (recurrenceChanged) {
            // ÉTAPE 1: Supprimer toutes les anciennes instances récurrentes (sauf l'événement parent)
            console.log('Suppression des anciennes instances récurrentes...');
            await Event.deleteMany({ parent_event_id: parentEventId });

            // ÉTAPE 2: Mettre à jour l'événement parent avec les nouvelles données
            console.log('Mise à jour de l\'événement parent...');
            const updatedParent = await Event.findByIdAndUpdate(
                parentEventId, 
                { $set: updateData }, 
                { new: true }
            );

            // ÉTAPE 3: Si la nouvelle configuration est récurrente, créer les nouvelles instances
            if (updatedParent.isRecurring && updatedParent.type_recurrence !== 'none') {
                console.log('Création des nouvelles instances récurrentes...');
                
                // Générer les nouvelles dates de récurrence
                const recurrenceDates = generateRecurrenceDates(
                    updatedParent.date_debut,
                    updatedParent.date_fin,
                    updatedParent.type_recurrence,
                    updatedParent.custom_recurrence_days
                );

                // Créer les nouvelles instances (en commençant par l'index 1 car l'index 0 est l'événement parent)
                const createdInstances = [];
                for (let i = 1; i < recurrenceDates.length; i++) {
                    const { date_debut, date_fin } = recurrenceDates[i];
                    
                    const instanceData = {
                        type: updatedParent.type,
                        titre: updatedParent.titre,
                        description: updatedParent.description,
                        fichier: updatedParent.fichier,
                        date_debut,
                        date_fin,
                        emplacement: updatedParent.emplacement,
                        lien: updatedParent.lien,
                        organisateur_id: updatedParent.organisateur_id,
                        projet_id: updatedParent.projet_id,
                        isRecurring: false, // Les instances ne sont pas récurrentes
                        type_recurrence: 'none',
                        rappel: updatedParent.rappel,
                        status: updatedParent.status,
                        participants: updatedParent.participants,
                        parent_event_id: parentEventId,
                        recurrence_instance: i
                    };
                    
                    const newInstance = new Event(instanceData);
                    const savedInstance = await newInstance.save();
                    createdInstances.push(savedInstance);
                }

                console.log(`${createdInstances.length} nouvelles instances créées`);
                return { 
                    parentEvent: updatedParent, 
                    instances: createdInstances,
                    message: `Récurrence mise à jour: ${createdInstances.length} nouvelles instances créées`
                };
            } else {
                console.log('Événement défini comme non récurrent');
                return { 
                    parentEvent: updatedParent, 
                    instances: [],
                    message: 'Événement défini comme non récurrent'
                };
            }
        } else {
            // Si la récurrence n'a pas changé, faire une mise à jour normale
            console.log('Mise à jour normale sans changement de récurrence...');
            
            // Exclure les champs qui ne doivent pas être mis à jour pour les instances
            const { date_debut, date_fin, isRecurring, type_recurrence, custom_recurrence_days, ...instanceUpdateData } = updateData;
            
            // Mettre à jour toutes les instances sauf les dates
            const instancesUpdateResult = await Event.updateMany(
                { parent_event_id: parentEventId },
                { $set: instanceUpdateData }
            );
            
            // Mettre à jour l'événement parent
            const updatedParent = await Event.findByIdAndUpdate(
                parentEventId, 
                { $set: updateData }, 
                { new: true }
            );

            console.log(`${instancesUpdateResult.modifiedCount} instances mises à jour`);
            return { 
                parentEvent: updatedParent, 
                instancesUpdated: instancesUpdateResult.modifiedCount,
                message: `Événement et ${instancesUpdateResult.modifiedCount} instances mis à jour`
            };
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des instances récurrentes:', error);
        throw error;
    }
};

/**
 * Nouvelle fonction: Récupère toutes les instances d'un événement récurrent
 */
const getRecurringEventInstances = async (parentEventId) => {
    try {
        const instances = await Event.find({
            $or: [
                { _id: parentEventId },
                { parent_event_id: parentEventId }
            ]
        }).sort({ date_debut: 1 });
        
        return instances;
    } catch (error) {
        console.error('Erreur lors de la récupération des instances récurrentes:', error);
        throw error;
    }
};

/**
 * Nouvelle fonction: Vérifie si un événement est récurrent
 */
const isRecurringEvent = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        return event && event.isRecurring && event.type_recurrence !== 'none';
    } catch (error) {
        console.error('Erreur lors de la vérification de récurrence:', error);
        return false;
    }
};

module.exports = {
    generateRecurrenceDates,
    createRecurringEventInstances,
    deleteRecurringEventInstances,
    updateRecurringEventInstances,
    getRecurringEventInstances,
    isRecurringEvent
};