import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon, PencilIcon, MapPinIcon, MailIcon, PhoneIcon,
  GlobeIcon, LinkIcon, DownloadIcon,
} from 'lucide-react';
import { Footer } from '../components/ui/footer';
import candidateService from '../services/candidate.service';
import authService from '../services/auth.service';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface ProfileData {
  name: string;
  last_name: string;
  email: string;
  job_title: string;
  skill_list: string[];
  resume_url: string;
}

export const MiPerfilCandidato: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authService.getUser();

        // Extracción defensiva del id: el tipo declarado no incluye id,
        // pero el objeto en runtime puede traerlo desde la sesión.
        const userId = user ? (user as unknown as { id: string }).id : undefined;

        if (typeof userId === 'string' && userId.length > 0) {
          const data = await candidateService.getCandidateProfile(userId);
          setProfile(data as unknown as ProfileData);
        } else {
          console.error('No se encontró ID de usuario en la sesión');
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      }
    };
    fetchData();
  }, []);

  if (!profile) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5]">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#1E2749] py-8 flex items-center justify-center">
        <h1 className="text-white font-semibold text-[26px] tracking-wide">Mi perfil</h1>
      </div>

      {/* ── Contenido ──────────────────────────────────────────────────── */}
      <div className="px-4 md:px-16 py-8 max-w-[1200px] mx-auto">
        <button
          onClick={() => navigate('/candidato')}
          className="mb-6 flex items-center gap-1 text-[#3351A6] text-sm font-medium hover:opacity-75"
        >
          <ChevronLeftIcon className="w-4 h-4" /> Volver al inicio
        </button>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Columna Izquierda */}
          <div className="flex flex-col gap-5 flex-1">
            <div className="bg-white shadow-sm rounded-xl px-6 py-5">
              <h2 className="font-bold text-[#1a1a2e] text-[22px]">{profile.name} {profile.last_name}</h2>
              <p className="text-[#F46036] font-semibold text-[15px]">{profile.job_title}</p>
            </div>

            <div className="bg-white shadow-sm rounded-xl px-6 py-6">
              <h3 className="font-bold text-[#1a1a2e] text-[17px] mb-3">Habilidades</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skill_list.map((skill) => (
                  <span key={skill} className="border border-[#cccccc] bg-white text-[#555555] text-[13px] font-medium px-3.5 py-[5px] rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="w-full lg:w-[330px]">
            <div className="bg-white shadow-sm rounded-xl px-6 py-5 space-y-4">
              <h3 className="font-bold text-[#1a1a2e]">Contacto</h3>
              <div className="flex items-center gap-3 text-[14px]">
                <MailIcon className="w-4 h-4 text-[#999999]" /> {profile.email}
              </div>
            </div>

            <a
              href={profile.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full py-3 rounded-lg font-bold text-[13px] text-white bg-[#F46036] hover:bg-[#e2552f] flex items-center justify-center gap-2"
            >
              <DownloadIcon className="w-4 h-4" /> DESCARGAR CV
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
