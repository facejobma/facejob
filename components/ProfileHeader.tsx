"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Ensure this import matches your project setup
import { Modal } from "@/components/ui/modal"; // Adjust the path as per your project structure
import Cookies from "js-cookie";
import { Edit, Key } from "lucide-react"; // Assuming you have Lucide icons installed
import { FaPhone, FaEnvelope, FaMapPin } from "react-icons/fa";

interface ProfileHeaderProps {
  id: number;
  first_name: string;
  last_name: string;
  tel: string;
  email: string;
  zip_code: string;
  headline: string;
  avatarUrl?: string;
  // coverImageUrl?: string;
  address?: string;
  companyName?: string;
  companyLogoUrl?: string;
  bio?: string;
  experiences?: [];
  skills?: [];
  projects?: [];
  educations?: [];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  id,
  first_name,
  last_name,
  headline,
  avatarUrl,
  tel,
  email,
  zip_code,
  address,
  companyName,
  companyLogoUrl,
  bio,
  experiences,
  skills,
  projects,
  educations,
}) => {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const router = useRouter(); // Using useRouter from next/navigation

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    newFirstName: first_name,
    newLastName: last_name,
    newHeadline: headline,
    newaddress: address || "",
    newCompanyName: companyName || "",
    newTel: tel,
    newEmail: email,
    newAddress: address || "",
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/candidate/updateId/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: formData.newFirstName,
            last_name: formData.newLastName,
            sector: formData.newHeadline,
            address: formData.newaddress,
            company: formData.newCompanyName,
            tel: formData.newTel,
            email: formData.newEmail,
          }),
        },
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("Updated profile data:", updatedData);
        setIsEditing(false);
      } else {
        console.error("Failed to update profile data");
      }
    } catch (error) {
      console.error("Error updating profile data:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChangeClick = () => {
    router.push("/dashboard/candidat/change-password");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 pb-2 overflow-hidden relative">
      {/* {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt="Cover"
          className="w-full h-40 object-cover relative"
        />
      )} */}

      <div className="p-10 relative">
        <div className="absolute top-4 right-6 flex gap-4">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={handleEditClick}
          >
            <Edit />
          </button>
          <button
            className="text-gray-400 hover:text-gray-600"
            title="Modifier le Mot de Passe"
            onClick={handlePasswordChangeClick}
          >
            <Key />
          </button>
        </div>
        {avatarUrl && (
          <div className="absolute left-10 top-6 md:top-12">
          <img
            src={avatarUrl || 'https://media.istockphoto.com/id/1337144146/fr/vectoriel/vecteur-dic%C3%B4ne-de-profil-davatar-par-d%C3%A9faut.jpg?s=612x612&w=0&k=20&c=BsQEN372p6cSuFnPGx06xUJ8eMhSjirWMAhodUi74uI='}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
        </div>
        )}

        <div className="ml-6 md:ml-36 mt-32 md:mt-0">
          <h1 className="text-2xl font-bold mb-1">
            {first_name} {last_name}
          </h1>
          <p className="text-gray-600 mb-2">{headline}</p>
          {/* {address && <p className="text-gray-600 mb-3">{address}</p>} */}
          {/* Add any additional content here */}
        </div>
        <br></br>

        {/* add tel and email and zip_code */}

        <div className="ml-6 md:ml-36 mt-32 md:mt-0">
          <div className="flex items-center mb-2">
            <FaPhone className="text-green-600 mr-2" />
            <p className="text-gray-600">{tel}</p>
          </div>
          <div className="flex items-center mb-2">
            <FaEnvelope className="text-green-600 mr-2" />
            <p className="text-gray-600">{email}</p>
          </div>
          <div className="flex items-center mb-2">
            <FaMapPin className="text-green-600 mr-2" />
            <p className="text-gray-600">{address}</p>
          </div>
        </div>
      </div>

      {/* Modal for editing profile */}
      <Modal
  isOpen={isEditing}
  onClose={handleCloseModal}
  title="Modifier le Profil"
  description="Mettre à jour vos informations"
>
  <form onSubmit={handleProfileUpdate}>
    {/* Définir une largeur maximale pour le formulaire */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Colonne de gauche */}
      <div className="w-full">
        <label htmlFor="newFirstName" className="block mb-2 font-bold">
          Prénom
        </label>
        <input
          type="text"
          id="newFirstName"
          name="newFirstName"
          value={formData.newFirstName}
          onChange={handleInputChange}
          placeholder="Enter votre prénom"
          className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
        />

        <label htmlFor="newEmail" className="block mb-2 font-bold">
          Email
        </label>
        <input
          type="email"
          id="newEmail"
          name="newEmail"
          value={formData.newEmail}
          onChange={handleInputChange}
          placeholder="Enter votre email"
          className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
        />

        <label htmlFor="newAddress" className="block mb-2 font-bold">
          Adresse
        </label>
        <input
          type="text"
          id="newAddress"
          name="newAddress"
          value={formData.newAddress}
          onChange={handleInputChange}
          placeholder="Enter votre adresse"
          className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
        />

        <label htmlFor="newHeadline" className="block mb-2 font-bold">
          Titre ou Poste recherché
        </label>
        <input
          type="text"
          id="newHeadline"
          name="newHeadline"
          value={formData.newHeadline}
          onChange={handleInputChange}
          placeholder="Entrez votre poste"
          className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
        />
      </div>

      {/* Colonne de droite */}
      <div className="w-full">
        <label htmlFor="newLastName" className="block mb-2 font-bold">
          Nom
        </label>
        <input
          type="text"
          id="newLastName"
          name="newLastName"
          value={formData.newLastName}
          onChange={handleInputChange}
          placeholder="Enter votre nom"
          className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
        />

        <label htmlFor="newTel" className="block mb-2 font-bold">
          Téléphone
        </label>
        <input
          type="text"
          id="newTel"
          name="newTel"
          value={formData.newTel}
          onChange={handleInputChange}
          placeholder="Enter votre téléphone"
          className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
        />

        <label htmlFor="newCompanyName" className="block mb-2 font-bold">
          Entreprise actuelle
        </label>
        <input
          type="text"
          id="newCompanyName"
          name="newCompanyName"
          value={formData.newCompanyName}
          onChange={handleInputChange}
          placeholder="Entrez votre entreprise"
          className="w-full border-gray-300 rounded-md py-2 px-3 mb-4"
        />
      </div>
    </div>

    {/* Submit Button */}
    <div className="mt-6 text-center">
      <button
        type="submit"
        className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
      >
        Sauvegarder
      </button>
    </div>
  </form>
</Modal>

    </div>
  );
};

export default ProfileHeader;
