const axios = require('axios');
const Holiday = require('../models/Holiday');
const getAllHolidays = async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
  
      // Récupérer les jours fériés depuis l'API
      const response = await axios.get(
        `https://calendarific.com/api/v2/holidays?&api_key=${process.env.CALENDARIFIC_API_KEY}&country=TN&year=${currentYear}`
      );
  
      const holidayData = response.data.response.holidays.map((holiday) => {
        // Validation du titre
        const title = holiday.name || "Jour férié inconnu";
  
        // Conversion du type pour correspondre à celui défini dans le schéma
        let holidayType = "autre"; // Valeur par défaut
        if (holiday.type.includes("National holiday")) {
          holidayType = "national";
        } else if (holiday.type.includes("religious")) {
          holidayType = "religieux";
        }
  
        return {
          titre: title,
          description: holiday.description || title,
          date: new Date(holiday.date.iso),
          type: holidayType
        };
      });
  
      // Récupérer les jours fériés ajoutés manuellement dans la base de données
      const manualHolidays = await Holiday.find({});
  
      // Fusionner les jours fériés provenant de l'API et ceux de la base de données
      const allHolidays = [...holidayData, ...manualHolidays];
  
      // Retourner la réponse avec tous les jours fériés
      res.status(200).json({
        message: 'Jours fériés récupérés avec succès.',
        holidays: allHolidays,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des jours fériés :", error.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
// Ajouter une holiday (admin uniquement)
const addHoliday = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès interdit' });
      }
  
      const { date, titre, description, type } = req.body;
      const dateToCheck = new Date(date);
  
      const existingHoliday = await Holiday.findOne({ date: dateToCheck });
      if (existingHoliday) {
        return res.status(400).json({ message: 'Une holiday avec cette date existe déjà.' });
      }
  
      const holiday = new Holiday({ date: dateToCheck, titre, description, type });
      await holiday.save();
  
      res.status(201).json({ success: true, message: 'Holiday ajoutée avec succès.', data: holiday });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
//Modifier une holiday (admin uniquement)
  const updateHoliday = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès interdit. Réservé aux administrateurs.' });
      }
  
      const { date, titre, description, type } = req.body;
      const holiday = await Holiday.findByIdAndUpdate(req.params.id, {
        date,
        titre,
        description,
        type
      }, { new: true });
  
      if (!holiday) {
        return res.status(404).json({ message: 'Holiday non trouvée' });
      }
  
      res.status(200).json({ success: true, message: 'Holiday mise à jour avec succès.', data: holiday });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  //  Supprimer une holiday (admin uniquement)
  const deleteHoliday = async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès interdit. Réservé aux administrateurs.' });
      }
  
      const holiday = await Holiday.findByIdAndDelete(req.params.id);
      if (!holiday) {
        return res.status(404).json({ message: 'Holiday non trouvée' });
      }
  
      res.status(200).json({ success: true, message: 'Holiday supprimée avec succès.' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  

module.exports = {
    getAllHolidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
  };
  
