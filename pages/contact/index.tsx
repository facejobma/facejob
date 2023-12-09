import React from "react";
import NavBar from "../../components/NavBar";

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-default">
      <NavBar />

      <div className="container mx-auto mt-10 p-10 w-1/2 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-6">
          We would love to hear from you! Fill out the form below to get in
          touch with us.
        </p>
        <form>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Your Name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Your Email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Your Message"
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
