// middleware/eventValidation.js
const { object, string, date, array, boolean, number, mixed } = require('yup');
const mongoose = require('mongoose');

const eventSchema = object({
    type: string()
        .required('Le type est obligatoire')
        .oneOf(['Évenement', 'Réunion', 'Tâche', 'Deadline', 'Holiday'], 'Type d\'événement invalide'),
    
    titre: string()
        .required('Le titre est obligatoire')
        .min(3, 'Le titre doit contenir au moins 3 caractères'),
    
    description: string().optional(),
    
    date_debut: date()
        .required('La date de début est obligatoire')
        .test(
            'is-before-end',
            'La date de début doit être avant la date de fin',
            function(value) {
                return this.parent.date_fin ? value < this.parent.date_fin : true;
            }
        ),
    
    date_fin: date()
        .required('La date de fin est obligatoire'),
    
    emplacement: string()
        .default('En ligne'),
    
   
   
    
    rappel: array()
        .of(
            object({
                time: number().required().positive(),
                unit: string().required().oneOf(['minutes', 'hours', 'days'])
            })
        )
       ,
    
    isRecurring: boolean().default(false),
    type_recurrence: string().when('isRecurring', {
        is: true,
        then: string().required().oneOf(['daily', 'weekly', 'monthly', 'personnalise'])
    }),
// participants: array()
//     .of(
//         object({
//             participant_id: string()
//                 .required('L\'ID du participant est obligatoire')
//                 .test('is-object-id', 'L\'ID du participant doit être un ObjectId valide', value => mongoose.Types.ObjectId.isValid(value)),
//             accept: boolean().default(false),
//             refuse: boolean().default(false),
//             message: string().optional()
//         })
//     )
//     .optional()
    // participants: array(string())
    //     .of(
    //         string()
    //             .required('L\'ID du participant est obligatoire')
    //             .test('is-object-id', 'L\'ID du participant doit être un ObjectId valide', value => mongoose.Types.ObjectId.isValid(value))
    //     )
    //     .optional(),
   
});
const validateEvent = async (req, res, next) => {
    try {
        // Convertir les dates en objets Date
        if (req.body.date_debut) req.body.date_debut = new Date(req.body.date_debut);
        if (req.body.date_fin) req.body.date_fin = new Date(req.body.date_fin);
        
        await eventSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        next();
    } catch (err) {
        // Vérifiez si `err.inner` existe et est un tableau
        if (err.inner && Array.isArray(err.inner)) {
            const errors = {};
            err.inner.forEach(e => {
                errors[e.path] = e.message;
            });
            return res.status(400).json({ success: false, errors });
        }

        // Si `err.inner` est undefined, renvoyez un message d'erreur générique
        return res.status(400).json({ success: false, message: err.message || 'Erreur de validation' });
    }
};

module.exports = validateEvent;