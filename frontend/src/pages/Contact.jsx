import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  User
} from "lucide-react";

import InfoPageLayout from "../components/InfoPageLayout";
import {
  apiRequest,
  getCurrentUser
} from "../services/api";

function Contact() {
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
    subject: "",
    message: ""
  });

  const [statusMessage, setStatusMessage] =
    useState("");

  const [statusType, setStatusType] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value
    });

    setStatusMessage("");
    setStatusType("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      setStatusMessage(
        "Please complete every field."
      );

      setStatusType("error");
      return;
    }

    setLoading(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const data = await apiRequest(
        "/api/contact",
        {
          method: "POST",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          })
        }
      );

      setStatusMessage(
        data.message ||
          "Your message was sent successfully."
      );

      setStatusType("success");

      setFormData((current) => ({
        ...current,
        subject: "",
        message: ""
      }));
    } catch (error) {
      setStatusMessage(
        error.message ||
          "Could not send your message."
      );

      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InfoPageLayout
      eyebrow="Contact"
      title="Send us a message."
      description="Report a problem, ask a question, or share feedback with the Achievement Hub team."
    >
      <section className="contact-page-card">
        <div className="contact-form-heading">
          <span className="panel-eyebrow">
            Get in touch
          </span>

          <h2>How can we help?</h2>

          <p>
            Complete the form below and your
            message will be saved for the
            Achievement Hub team.
          </p>
        </div>

        <form
          className="contact-page-form contact-wide-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="contact-form-row">
            <div className="contact-form-field">
              <label htmlFor="contact-name">
                Full Name
              </label>

              <div className="profile-input-group">
                <User size={19} />

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={80}
                />
              </div>
            </div>

            <div className="contact-form-field">
              <label htmlFor="contact-email">
                Email Address
              </label>

              <div className="profile-input-group">
                <Mail size={19} />

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={120}
                />
              </div>
            </div>
          </div>

          <div className="contact-form-field">
            <label htmlFor="contact-subject">
              Subject
            </label>

            <div className="profile-input-group">
              <MessageSquare size={19} />

              <input
                id="contact-subject"
                name="subject"
                type="text"
                placeholder="What is this about?"
                value={formData.subject}
                onChange={handleChange}
                maxLength={150}
              />
            </div>
          </div>

          <div className="contact-form-field">
            <div className="contact-label-row">
              <label htmlFor="contact-message">
                Message
              </label>

              <span>
                {formData.message.length}/2000
              </span>
            </div>

            <textarea
              id="contact-message"
              name="message"
              placeholder="Write your message..."
              rows="6"
              value={formData.message}
              onChange={handleChange}
              maxLength={2000}
            ></textarea>
          </div>

          <div className="contact-form-actions">
            <button
              className="info-primary-button contact-submit-button"
              type="submit"
              disabled={loading}
            >
              <Send size={18} />

              {loading
                ? "Sending..."
                : "Send Message"}
            </button>

            {statusMessage && (
              <div
                className={`contact-form-message ${statusType}`}
              >
                {statusMessage}
              </div>
            )}
          </div>
        </form>
      </section>
    </InfoPageLayout>
  );
}

export default Contact;
