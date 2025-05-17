// Application configuration settings
const config = {
    // Timezone configuration
    timezone: {
        // Tunisia is UTC+1
        offset: 1,
        offsetMs: 60 * 60 * 1000, // 1 hour in milliseconds
        name: 'Africa/Tunis'
    },

    // Email configuration
    email: {
        service: 'gmail',
        auth: {
            user: 'tasko.tasko2001@gmail.com',
            pass: 'oilc qrdz qhqd hbgr'
        },
        sender: 'tasko.tasko2001@gmail.com',
        debugLevel: process.env.NODE_ENV === 'production' ? false : true
    },

    // Reminder configuration
    reminders: {
        defaultReminders: {
            'Tâche': [{ time: 30, unit: 'minutes' }],
            'Holiday': [{ time: 1, unit: 'days' }],
            'Deadline': [{ time: 1, unit: 'days' }],
            'Réunion': [
                { time: 1, unit: 'hours' },
                { time: 30, unit: 'minutes' }
            ],
            'Événement': [
                { time: 1, unit: 'hours' },
                { time: 30, unit: 'minutes' }
            ]
        },
        batchSize: 100
    }
};

module.exports = config;