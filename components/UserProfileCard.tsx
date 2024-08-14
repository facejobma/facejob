import Image from "next/image";
import { FC } from "react";


interface UserProfileCardProps {
  name: string;
  title: string;
  photoUrl: string;
  email: string;
  phone: string;
  skills: string[];
  experiences: string[];
}

export const UserProfileCard: FC<UserProfileCardProps> = ({
  name,
  title,
  photoUrl,
  email,
  phone,
  skills,
  experiences,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Image
              src={photoUrl}
              alt={name}
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{name}</h1>
            <p className="text-gray-600">{title}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-700">
            <strong>Email:</strong> {email}
          </p>
          <p className="text-gray-700">
            <strong>Phone:</strong> {phone}
          </p>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <ul className="list-disc pl-6">
            {skills.map((skill, index) => (
              <li key={index} className="text-gray-700">
                {skill}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Experiences</h2>
          <ul className="list-disc pl-6">
            {experiences.map((experience, index) => (
              <li key={index} className="text-gray-700">
                {experience}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
