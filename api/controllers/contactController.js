const ContactMessage = require("../models/ContactMessage");

const createContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: "Please complete every field."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        if (cleanName.length < 2) {
            return res.status(400).json({
                message: "Please enter your full name."
            });
        }

        if (cleanSubject.length < 3) {
            return res.status(400).json({
                message: "The subject is too short."
            });
        }

        if (cleanMessage.length < 10) {
            return res.status(400).json({
                message: "The message must be at least 10 characters."
            });
        }

        const contactMessage =
            await ContactMessage.create({
                name: cleanName,
                email: cleanEmail,
                subject: cleanSubject,
                message: cleanMessage
            });

        res.status(201).json({
            message: "Your message was sent successfully.",
            contactMessage: {
                _id: contactMessage._id,
                name: contactMessage.name,
                email: contactMessage.email,
                subject: contactMessage.subject,
                status: contactMessage.status,
                createdAt: contactMessage.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Could not send your message."
        });
    }
};

module.exports = {
    createContactMessage
};
