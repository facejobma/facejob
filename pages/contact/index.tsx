import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import { toast } from "react-hot-toast";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Your message has been sent successfully!");

        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        toast.error("Error sending message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message. Please try again.");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container mx-auto mt-10 p-10 w-1/2 bg-white rounded-lg shadow-lg font-default">
        <h1 className="text-3xl font-semibold mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-6">
          We would love to hear from you! Fill out the form below to get in
          touch with us.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
