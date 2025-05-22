const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


 const sendOrganiastionCodeEmail = async (email, password) => {
    
    try {
        transporter.sendMail({
            from: "ziedbensalah10@gmail.com",
            to: email,
            subject: "Workspace Invitation",
            html: `<p>You have been invited to the workspace. Here is your password: <strong>${password}</strong></p>`
        });
    } catch (err) {
        console.log(err);
    }

};

const ForgetPasswordEmail = async (email, password) => {
     
    try{
        transporter.sendMail({
            from:"ziedbensalah10@gmail.com",
            to: email,
            subject: "Password Reset",
            html: `here is your new password: <strong>${password}</strong>`
        });


    }catch (err){
        console.log(err);
    }
}


const sendTaskCreatedNotification = async (managerEmail, managerName, taskTitle, projectName, priority, status) => {
    if (!managerEmail) {
        console.log('❗ Email manquant pour envoyer la notification.');
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: managerEmail,
            subject: `Nouvelle tâche dans votre projet "${projectName}"`,
            html: `
                <p>Bonjour <strong>${managerName || 'Manager'}</strong>,</p>
                <p>Une nouvelle tâche a été créée dans votre projet <strong>${projectName}</strong>.</p>
                <ul>
                    <li><strong>Tâche :</strong> ${taskTitle}</li>
                    <li><strong>Priorité :</strong> ${priority}</li>
                    <li><strong>Statut :</strong> ${status}</li>
                </ul>
                <p>Cordialement,<br/>L'équipe Jira Clone</p>
            `
        });
    } catch (err) {
        console.log("sendTaskCreatedNotification error:", err);
    }
};

const SendOtpMail = async (to, subject, otp) => {
    try {
        await transporter.sendMail({
            from: "ziedbensalah10@gmail.com",
            to: to,
            subject: subject,
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`
        });
    } catch (err) {
        console.log(err);
    }
};
module.exports = {
    sendOrganiastionCodeEmail,
    ForgetPasswordEmail,
    SendOtpMail,
    ForgetPasswordEmail,
    sendTaskCreatedNotification
};