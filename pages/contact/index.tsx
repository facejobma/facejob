import React, {useState} from "react";
import NavBar from "../../components/NavBar";
import {toast} from "react-hot-toast";

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({...prevData, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Votre message a bien été envoyé !");

                setFormData({
                    name: "",
                    email: "",
                    message: "",
                });
            } else {
                toast.error("Message d’erreur. Veuillez réessayer.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Message d’erreur. Veuillez réessayer.");
        }
    };

    return (
        <div>
            <NavBar/>
            <div className="container mx-auto mt-10 p-10 w-1/2 bg-white rounded-lg shadow-lg font-default">
                <h1 className="text-3xl font-semibold mb-6">Contactez-nous</h1>
                <p className="text-gray-600 mb-6">
                    Nous aimerions avoir de vos nouvelles! Remplissez le formulaire ci-dessous pour entrer
                    prendre contact avec nous.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Nom
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
                            placeholder="votre email"
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
                            placeholder="Votre message"
                            value={formData.message}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                        Envoyer le message
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactPage;
