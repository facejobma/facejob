import React from "react";
import { 
  MapPin, Briefcase, GraduationCap, Award, Code, Folder, 
  Calendar, Clock, Star, TrendingUp, Building2
} from "lucide-react";

interface Formation {
  id: number;
  school: string;
  diplome: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  url: string;
}

interface Candidate {
  image: string;
  full_name: string;
  job: { name: string };
  city: string;
  years_of_experience: number;
  bio: string;
  profile_completion: number;
  formations: Formation[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
}

interface CandidateCardProps {
  candidate: Candidate;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Header with Profile Image */}
      <div className="relative h-64 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                {candidate.image ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${candidate.image}`}
                    alt={candidate.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600 text-white text-3xl font-bold">
                    {candidate.full_name[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-bold text-white mb-1">{candidate.full_name}</h2>
              <p className="text-white/90 font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {candidate.job.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profil complété</span>
          <span className="text-sm font-bold text-green-600">{candidate.profile_completion}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${candidate.profile_completion}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Localisation</p>
            <p className="font-semibold text-gray-900">{candidate.city || "Non spécifié"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Expérience</p>
            <p className="font-semibold text-gray-900">{candidate.years_of_experience} ans</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {candidate.bio && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            À propos
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">{candidate.bio}</p>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-6">
        {/* Education */}
        {candidate.formations && candidate.formations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Formation ({candidate.formations.length})
            </h3>
            <div className="space-y-3">
              {candidate.formations.map((formation) => (
                <div key={formation.id} className="bg-indigo-50 rounded-xl p-3">
                  <p className="font-semibold text-gray-900 text-sm">{formation.diplome}</p>
                  <p className="text-sm text-indigo-600 font-medium">{formation.school}</p>
                  <p className="text-xs text-gray-600 mt-1">{formation.field_of_study}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formation.start_date} - {formation.end_date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {candidate.experiences && candidate.experiences.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Expérience ({candidate.experiences.length})
            </h3>
            <div className="space-y-3">
              {candidate.experiences.map((exp) => (
                <div key={exp.id} className="bg-blue-50 rounded-xl p-3">
                  <p className="font-semibold text-gray-900 text-sm">{exp.title}</p>
                  <p className="text-sm text-blue-600 font-medium">{exp.company}</p>
                  {exp.location && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {exp.location}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exp.start_date} - {exp.is_current ? "Présent" : exp.end_date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-green-600" />
              Compétences ({candidate.skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {candidate.projects && candidate.projects.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Folder className="w-4 h-4 text-orange-600" />
              Projets ({candidate.projects.length})
            </h3>
            <div className="space-y-3">
              {candidate.projects.map((project) => (
                <div key={project.id} className="bg-orange-50 rounded-xl p-3">
                  <p className="font-semibold text-gray-900 text-sm">{project.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-600 hover:text-orange-700 mt-2 inline-block"
                    >
                      Voir le projet →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
