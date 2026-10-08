import React, { useEffect, useState, type JSX } from "react";
import {
  Menu as MenuIcon,
  ExternalLink as ExternalLinkIcon,
  Briefcase as BriefcaseIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { HeaderLogo } from "../components/ui/header-logo";
import { Footer } from "../components/ui/footer";
import { CandidatoSideMenu } from "../components/candidato-side-menu";
import AuthService from "../services/auth.service";
import CandidateProfileService from "../services/candidate-profile.service";
import type {
  CandidateProfile,
} from "../types/candidate-profile.types";
import type { WorkExperience } from "../types/experience.types";
import { parseSkills } from "../utils/parse-skills";
import { getInitials } from "../utils/initials";
import { formatMonthYear } from "../utils/format-date";

const CARD_CLASS = "bg-white border border-[#dedede] shadow-sm rounded-xl";

const formatRange = (exp: WorkExperience): string | null => {
  if (!exp.start_date && !exp.end_date) return null;

  const start = exp.start_date ? formatMonthYear(exp.start_date) : '?';
  // end_date null = trabajo actual
  const end = exp.end_date ? formatMonthYear(exp.end_date) : 'actual';

  return `${start} – ${end}`;
};

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element => (
  <section className={`${CARD_CLASS} px-5 md:px-6 py-5`}>
    <h3 className="font-bold text-navy text-base mb-4">{title}</h3>
    {children}
  </section>
);

const Label = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <p className="text-[11px] uppercase tracking-wide text-[#999999]">
    {children}
  </p>
);

export const PerfilCandidato = (): JSX.Element => {
  const user = AuthService.getUser();
  const userId = user?.user_id != null ? String(user.user_id) : "";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!userId) {
        setError("No se encontró el usuario autenticado.");
        setLoading(false);
        return;
      }

      try {
        // Perfil propio: candidate_id coincide con user_id
        const result = await CandidateProfileService.getCandidateProfile(
          userId
        );

        if (!active) return;

        const data = result.data;

        if (!data || !data.first_name) {
          setError("No encontramos tu perfil.");
        } else {
          setProfile(data as CandidateProfile);
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error ? err.message : "Error al cargar el perfil."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [userId]);

  const skills = parseSkills(profile?.skills);

  const experience = [
    ...(Array.isArray(profile?.experience) ? profile!.experience! : []),
  ].sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""));

  const hasResume = !!profile?.resume_url;
  const hasSkills = skills.length > 0;
  const hasExperience = experience.length > 0;

  // 3 ítems, cada uno vale lo mismo
  const checklist = [
    { label: "Currículum", done: hasResume },
    { label: "Habilidades", done: hasSkills },
    { label: "Experiencia", done: hasExperience },
  ];

  const completion = Math.round(
    (checklist.filter((c) => c.done).length / checklist.length) * 100
  );

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : "";

  return (
    <div className="bg-page w-full min-h-screen flex flex-col">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-navy relative z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors"
          onClick={() => setIsMenuOpen(true)}
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>
        <HeaderLogo />
      </nav>

      <CandidatoSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <section className="w-full bg-navy-light py-6 md:py-8">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8">
          <h1 className="font-bold text-white text-2xl md:text-3xl text-center">
            Mi perfil
          </h1>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8">
          {loading ? (
            <div className={`${CARD_CLASS} px-8 py-12 text-center`}>
              <p className="text-[#757575] text-sm">Cargando perfil...</p>
            </div>
          ) : error || !profile ? (
            <div className={`${CARD_CLASS} px-8 py-12 text-center`}>
              <p className="text-brand text-sm">
                {error ?? "No encontramos tu perfil."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 items-start">
              {/* IZQUIERDA: persona + progreso + accesos */}
              <div className="flex flex-col gap-5 lg:sticky lg:top-6">
                {/* Persona */}
                <div className={`${CARD_CLASS} px-5 py-6 text-center`}>
                  <div className="w-16 h-16 rounded-full bg-brand text-white font-bold text-xl flex items-center justify-center mx-auto">
                    {getInitials(profile.first_name, profile.last_name)}
                  </div>
                  <h2 className="mt-3 font-bold text-navy text-base leading-tight">
                    {fullName}
                  </h2>
                  <span className="inline-block mt-2 rounded-full bg-surface px-3 py-0.5 text-xs font-semibold text-[#3b4a86]">
                    Candidato
                  </span>

                  <div className="mt-5 pt-4 border-t border-[#f0f0f0] text-left">
                    <Label>Email</Label>
                    <p className="mt-1 text-sm text-[#333333] break-all">
                      {profile.email}
                    </p>
                  </div>

                  {hasResume && (
                    <a
                      href={profile.resume_url ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-dark px-4 py-2.5 font-medium text-white text-sm transition-colors"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      Ver currículum
                    </a>
                  )}
                </div>

                {/* Progreso */}
                <div className={`${CARD_CLASS} px-5 py-5`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-navy text-base">
                      Perfil completo
                    </h3>
                    <span className="font-bold text-brand-dark text-sm tabular-nums">
                      {completion}%
                    </span>
                  </div>

                  <div
                    className="h-1.5 rounded-full bg-surface overflow-hidden"
                    role="progressbar"
                    aria-valuenow={completion}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  <ul className="mt-3 flex flex-col">
                    {checklist.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center gap-2.5 py-2.5 border-t border-[#f0f0f0] text-sm"
                      >
                        {item.done ? (
                          <CheckCircleIcon className="w-4 h-4 text-accent flex-shrink-0" />
                        ) : (
                          <CircleIcon className="w-4 h-4 text-[#999999] flex-shrink-0" />
                        )}
                        <span
                          className={
                            item.done ? "text-navy" : "text-[#757575]"
                          }
                        >
                          {item.label}
                          {!item.done && " (pendiente)"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* DERECHA: habilidades + experiencia */}
              <div className="flex flex-col gap-5 min-w-0">
                <SectionCard title="Habilidades">
                  {hasSkills ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-[#dbe5fb] bg-[#eef3ff] px-3 py-1 text-[13px] font-medium text-accent"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#757575] text-sm">
                      Todavía no hay habilidades cargadas.
                    </p>
                  )}
                </SectionCard>

                <SectionCard title="Experiencia">
                  {hasExperience ? (
                    <ol>
                      {experience.map((exp, index) => {
                        const isLast = index === experience.length - 1;
                        const range = formatRange(exp);

                        return (
                          <li
                            key={`${exp.job_name}-${exp.company_name}-${exp.start_date}-${index}`}
                            className="flex gap-4"
                          >
                            <div className="flex flex-col items-center">
                              <span
                                className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${index === 0 ? "bg-brand" : "bg-[#cfd3e6]"
                                  }`}
                              />
                              {!isLast && (
                                <span className="w-px flex-1 bg-[#e5e5e5] mt-1" />
                              )}
                            </div>

                            <div className={`min-w-0 ${isLast ? "" : "pb-5"}`}>
                              <p className="font-bold text-navy text-sm leading-tight">
                                {exp.job_name ?? "Puesto sin especificar"}
                              </p>
                              {exp.company_name && (
                                <p className="text-[#757575] text-sm mt-0.5">
                                  {exp.company_name}
                                </p>
                              )}
                              {range && (
                                <p className="text-[#757575] text-xs mt-1">
                                  {range}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#d9d9d9] bg-[#fafafa] px-5 py-6 text-center">
                      <BriefcaseIcon className="w-5 h-5 text-[#999999] mx-auto mb-1.5" />
                      <p className="text-[#757575] text-sm">
                        Todavía no hay experiencia cargada.
                      </p>
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};