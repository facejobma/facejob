"use client";

import React, { useState } from "react";
import { Edit, Mail, Phone, Linkedin, MapPin } from "lucide-react"; // Import icons from Lucide React
import { Modal } from "@/components/ui/modal";
import Cookies from "js-cookie";

interface ContactSectionProps {
  id: number;
  email: string;
  phone: string;
  linkedin: string;
  adresse: string;
}
const ContactSection: React.FC<ContactSectionProps> = ({ id, email, phone, linkedin, adresse }) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [newPhone, setNewPhone] = useState(phone);
  const [newLinkedin, setNewLinkedin] = useState(linkedin);
  const [newAdresse, setNewAdresse] = useState(adresse);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setNewEmail(email);
    setNewPhone(phone);
    setNewLinkedin(linkedin);
    setNewAdresse(adresse);
  };

  const handleContactUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enterprise/updateId/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newEmail,
            phone: newPhone,
            linkedin: newLinkedin,
            adresse: newAdresse,
          }),
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("Updated contact:", updatedData);
        setIsEditing(false);
      } else {
        console.error("Failed to update contact");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Coordonnées de l’entreprise</h2>
        <button
          onClick={handleEditClick}
          className="text-gray-400 hover:text-gray-600"
        >
          <Edit />
        </button>
      </div>
      <div className="p-6 relative grid grid-cols-1 gap-4">
        <div className="bg-gray-100 rounded-lg p-4 border">
          <div className="flex items-center">
            <Mail className="mr-2" />
            <p>{newEmail}</p>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border">
          <div className="flex items-center">
            <Phone className="mr-2" />
            <p>{newPhone}</p>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border">
          <div className="flex items-center">
            <Linkedin className="mr-2" />
            <a href={newLinkedin} target="_blank" rel="noopener noreferrer">{newLinkedin}</a>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border">
          <div className="flex items-center">
            <MapPin className="mr-2" />
            <p>{newAdresse}</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Modifier les informations de Contact"
        description="Mettre à jour les coordonnées de Contact de l’entreprise"
      >
        <form onSubmit={handleContactUpdate}>
          <label className="block mb-2">
            Email
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="block w-full mt-1 p-2 border rounded"
              placeholder="exemple@email.com"
            />
          </label>
          <label className="block mb-2">
          Téléphone
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="block w-full mt-1 p-2 border rounded"
              placeholder="+212 6 12 34 56 78"
            />
          </label>
          <label className="block mb-2">
          LinkedIn
            <input
              type="text"
              value={newLinkedin}
              onChange={(e) => setNewLinkedin(e.target.value)}
              className="block w-full mt-1 p-2 border rounded"
              placeholder="https://linkedin.com/in/votre-profil"
            />
          </label>
          <label className="block mb-2">
          Adresse Postale
            <input
              type="text"
              value={newAdresse}
              onChange={(e) => setNewAdresse(e.target.value)}
              className="block w-full mt-1 p-2 border rounded"
              placeholder="123 Rue Exemple, Casablanca"
            />
          </label>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
          >
            Sauvegarder
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ContactSection;
