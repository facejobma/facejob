import {FormEvent, useState} from "react";
import {toast} from "react-hot-toast";
import emailIcon from "../../../public/images/envelope.png";
import Image from "next/image";
import Link from "next/link";
import NavBar from "../../../components/NavBar";
import {useRouter} from "next/router";


const ForgetPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const router = useRouter();
    const actor = router.query.actor?.toString() || "candidat"

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email) {
            return toast.error(`Veuillez remplir le ${email} champ!`);
        }

        const formData = {
            email,
        };

        try {
            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL + `/api/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            console.log(response);

            if (!response.ok) {
                toast.error("Email n'est pas valides");
                return;
            }

            toast.success("Le lien de réinitialisation a été envoyé avec succès !");

            router.push(`/auth/login-${actor}`);
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.message || "Une erreur s’est produite lors de la connexion"
            );
        }
    };

    const validateEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError("Adresse e-mail invalide");
        } else {
            setEmailError("");
        }
    };


    return (
        <>
            <NavBar/>
            <div
                className="flex flex-col items-center rounded-lg border border-newColor font-default mx-auto my-28"
                style={{width: "650px", height: "420px"}}
            >
                <Image
                    src={emailIcon}
                    alt="google"
                    width={90}
                    height={90}
                    className="mt-10 flex space-x-4"
                    // style={{ width: "110px", height: "110px" }}
                />
                <h2 className="text-3xl font-medium text-second my-2 py-4 mb-4">
                    Mettez à jour votre mot de passe
                </h2>
                <form className="flex flex-col space-y-6 my-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            validateEmail(e.target.value);
                        }}
                        style={{width: "400px", margin: "auto"}}
                        className={`px-4 py-2 rounded border border-gray ${
                            emailError ? "border-red-500" : ""
                        }`}
                    />
                    {emailError && (
                        <p className="text-red-500 m-12 text-sm">{emailError}</p>
                    )}

                    <button
                        type="submit"
                        className="py-2 px-8 m-12 rounded-full font-medium text-base text-white bg-primary"
                    >
                        Envoyer un E-mail
                    </button>
                    <p className="font-normal my-2 mx-32 text-second">
                        Vous avez déjà un compte ?{" "}
                        <Link href={`/auth/login-${actor}`} className="text-primary">
                            Se connecter
                        </Link>
                    </p>
                    {/* </div> */}
                </form>
            </div>
        </>
    );
};

export default ForgetPasswordForm;
