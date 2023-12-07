"use client";
import { useState } from "react";
// import google from "../../../assets/imgs/google.png";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import facebook from "../../../assets/imgs/facebook.png";
import {toast} from "react-hot-toast";


interface SignupFormCandidatProps {
  onNextStep: () => void;
}

const SignupFormCandidat: React.FC<SignupFormCandidatProps> = ({
  onNextStep,
}) => {
  const router = useRouter();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [tel, seTel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = {
      prenom,
      nom,
      tel,
      email,
      password,
      passwordConfirm,
      acceptTerms,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/candidat/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Your account created successfuly!");
        onNextStep();
      } else {
        const errorData = await response.json();
        toast.error("Registration failed!");
        console.error("Registration failed:", errorData);
      }
    } catch (error) {
      toast.error("Error during registration!");
      console.error("Error during registration:", error);
    }
  }

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length < 8;
  };

  return (
    <div className="flex flex-col items-center font-default rounded-lg border border-newColor p-4">
      <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4">
        Créez votre compte et trouvez le job idéal
      </h2>
      <div className="flex space-x-4">
        {/* <Image
                        src={google}
                        alt="google"
                        style={{width: "35px", height: "35px"}}
                    /> */}
        <button
          // onClick={() => ()}
          className="w-full py-2 px-36 rounded-full font-medium text-base bg-slate-600   text-white"
        >
          Continue with Google
        </button>
      </div>
      <div className="mt-4 flex space-x-4">
        {/* <Image
                        src={facebook}
                        alt="facebook"
                        style={{width: "35px", height: "35px"}}
                    /> */}
        <button
          // onClick={() => ()}
          className="py-2 px-36 rounded-full font-medium text-base bg-slate-600 text-white"
        >
          Continue with Facebook
        </button>
      </div>
      <p className="mx-4 my-2 text-gray-500 font-medium">Or</p>
      <form
        className="flex flex-col space-y-6 my-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit(e);
        }}
      >
        <div className="flex flex-row gap-4">
          <input
            required={true}
            type="text"
            placeholder="Prenom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className={`px-4 py-2 rounded border border-gray w-1/2`}
          />
          <input
            required={true}
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={`px-4 py-2 rounded border border-gray w-1/2`}
          />
        </div>
        <input
          required={true}
          type="tel"
          placeholder="Tel"
          value={tel}
          onChange={(e) => {
            seTel(e.target.value);
          }}
          className="px-4 py-2 rounded border border-gray"
        />
        <input
          required={true}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          // style={{ width: "500px" }}
          className="px-4 py-2 rounded border border-gray"
        />
        {/*{validateEmail(email) && <p className="text-red-500 text-sm">{validateEmail(email)}</p>}*/}
        <input
          required={true}
          type="password"
          placeholder="Password (8 or more characters)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
          className={`px-4 py-2 rounded border  border-gray `}
        />
        <input
          required={true}
          type="password"
          placeholder="Confirm Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={`px-4 py-2 rounded border border-gray`}
        />
        <div className="flex space-x-2" style={{ width: "500px" }}>
          <input
            required={true}
            type="checkbox"
            id="termsCheckbox"
            className={`rounded border border-gray-300`}
            onClick={() => {
              setAcceptTerms((prv) => !prv);
            }}
          />
          <label
            htmlFor="termsCheckbox"
            className="text-gray-500 font-normal text-sm"
          >
            Oui, je comprends et j'accepte{" "}
            <Link href="/terms" className="text-primary">
              les conditions d'utilisation de facejob.
            </Link>
          </label>
        </div>
        {/* <div className="my-2"> */}
        <button
          type="submit"
          className="py-2 px-20 rounded-full font-medium text-base text-white bg-primary"
        >
          Create my account
        </button>
        <p className="font-normal my-2 mx-32 text-second">
          Already have an account ?{" "}
          <Link href="/signin" className="text-primary">
            Log In
          </Link>
        </p>
        {/* </div> */}
      </form>
    </div>
  );
};
export default SignupFormCandidat;
