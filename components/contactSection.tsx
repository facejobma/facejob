"use client";

import React, { useState } from "react";
import { Edit, Mail, Phone, Linkedin, MapPin } from "lucide-react";
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">Coordonnées de l'entreprise</h2>
        <button
          onClick={handleEditClick}
          className="text-gray-400 hover:text-green-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Email</p>
              <p className="text-sm text-gray-900 truncate">{newEmail}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
              <p className="text-sm text-gray-900 truncate">{newPhone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Linkedin className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 mb-0.5">LinkedIn</p>
              <a 
                href={newLinkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-700 truncate block"
              >
                {newLinkedin || "Non renseigné"}
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Adresse</p>
              <p className="text-sm text-gray-900 truncate">{newAdresse}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleEditClick}
          className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Modifier les coordonnées
        </button>
      </div>



      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Modifier les informations de Contact"
        description="Mettre à jour les coordonnées de Contact de l'entreprise"
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
