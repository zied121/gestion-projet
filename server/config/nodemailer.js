const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "zied.s@convergen.io",
        pass: "tcle gobb atrz qrwk"
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
    SendOtpMail 
};
