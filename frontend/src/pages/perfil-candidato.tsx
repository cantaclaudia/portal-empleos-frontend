import React, { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

import {
  Menu as MenuIcon,
  Mail as MailIcon,
  ExternalLink as ExternalLinkIcon,
  Briefcase as BriefcaseIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { HeaderLogo } from "../components/ui/header-logo";
import { Footer } from "../components/ui/footer";
import { ErrorMessage } from "../components/ui/error-message";
import { CandidatoSideMenu } from "../components/candidato-side-menu";

import AuthService from "../services/auth.service";
import CandidateProfileService from "../services/candidate-profile.service";

import type {
  CandidateProfile,
  CandidateExperience,
} from "../types/candidate-profile.types";

import { ROUTES } from "../routes";

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

// 'YYYY-MM-DD' -> 'mar 2022'
const formatMonthYear = (
  value: string | null
): string | null => {
  if (!value) return null;

  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;

  if (
    !year ||
    Number.isNaN(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return null;
  }

  return `${MONTHS[monthIndex]} ${year}`;
};

const formatRange = (
  exp: CandidateExperience
): string | null => {
  const start = formatMonthYear(exp.start_date);

  // end_date en null significa trabajo actual
  const end = exp.end_date
    ? formatMonthYear(exp.end_date)
    : "actual";

  if (!start && !exp.end_date) return null;

  return `${start ?? "?"} – ${end ?? "?"}`;
};

const getInitials = (
  first: string,
  last: string
): string =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element => (
  <section className="rounded-[14px] bg-white border border-gray-100 shadow-sm p-5 md:p-6">
    <h2 className="font-bold text-[#05073c] text-base mb-4">
      {title}
    </h2>

    {children}
  </section>
);

export const PerfilCandidato = (): JSX.Element => {
  const navigate = useNavigate();

  const user = AuthService.getUser();

  const userId =
    user?.user_id != null
      ? String(user.user_id)
      : "";

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [profile, setProfile] =
    useState<CandidateProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!userId) {
        setError(
          "No se encontró el usuario autenticado."
        );
        setLoading(false);
        return;
      }

      try {
        // Perfil propio: candidate_id coincide con user_id
        const result =
          await CandidateProfileService.getCandidateProfile(
            userId,
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
          err instanceof Error
            ? err.message
            : "Error al cargar el perfil."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [userId]);

  const skills = (profile?.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const experience = [
    ...(Array.isArray(profile?.experience)
      ? profile!.experience!
      : []),
  ].sort((a, b) =>
    (b.start_date ?? "").localeCompare(
      a.start_date ?? ""
    )
  );

  const hasResume = !!profile?.resume_url;
  const hasSkills = skills.length > 0;
  const hasExperience = experience.length > 0;

  // Regla definida en el front:
  // 3 ítems, cada uno vale lo mismo
  const checklist = [
    {
      label: "Currículum",
      done: hasResume,
    },
    {
      label: "Habilidades",
      done: hasSkills,
    },
    {
      label: "Experiencia",
      done: hasExperience,
    },
  ];

  const completion = Math.round(
    (checklist.filter((c) => c.done).length /
      checklist.length) *
      100
  );

  return (
    <div className="bg-[#EFEFEF] w-full min-h-screen flex flex-col">
      {/* HEADER */}
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] relative z-50">
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

      {/* LOADING */}
      {loading ? (
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <p className="text-[#757575] text-sm">
            Cargando perfil...
          </p>
        </main>
      ) : error || !profile ? (
        /* ERROR */
        <main className="flex-1 w-full max-w-[600px] mx-auto px-4 py-12">
          <ErrorMessage
            message={
              error ?? "No encontramos tu perfil."
            }
          />
        </main>
      ) : (
        <>
          {/* PERFIL / IDENTIDAD */}
          <section className="w-full bg-[#1E2749] py-7 md:py-8">
            <div className="max-w-[1100px] mx-auto px-4 md:px-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Iniciales */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/15 flex items-center justify-center font-bold text-lg md:text-xl text-white flex-shrink-0">
                    {getInitials(
                      profile.first_name,
                      profile.last_name
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-white/60 text-sm">
                      Mi perfil
                    </p>

                    <h1 className="font-bold text-white text-xl md:text-2xl leading-tight truncate">
                      {profile.first_name}{" "}
                      {profile.last_name}
                    </h1>

                    <p className="flex items-center gap-1.5 text-white/70 text-sm mt-1 min-w-0">
                      <MailIcon className="w-4 h-4 flex-shrink-0" />

                      <span className="truncate">
                        {profile.email}
                      </span>
                    </p>
                  </div>
                </div>

                {hasResume && (
                  <a
                    href={
                      profile.resume_url ??
                      undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f46036] hover:bg-[#d9512e] px-5 py-2.5 font-medium text-white text-sm transition-colors whitespace-nowrap"
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                    Ver currículum
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* CONTENIDO */}
          <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-8 py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] gap-5 items-start">
              {/* COLUMNA IZQUIERDA */}
              <div className="flex flex-col gap-5">
                {/* PERFIL COMPLETO */}
                <SectionCard title="Perfil completo">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#757575] text-xs">
                      Progreso
                    </span>

                    <span className="font-bold text-[#d9512e] text-sm">
                      {completion}%
                    </span>
                  </div>

                  <div
                    className="h-1.5 rounded-full bg-[#eceef6] overflow-hidden"
                    role="progressbar"
                    aria-valuenow={completion}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-[#f46036]"
                      style={{
                        width: `${completion}%`,
                      }}
                    />
                  </div>

                  <ul className="mt-4 flex flex-col">
                    {checklist.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center gap-2.5 py-2.5 border-t border-gray-100 text-sm"
                      >
                        {item.done ? (
                          <CheckCircleIcon className="w-4 h-4 text-[#3351A6] flex-shrink-0" />
                        ) : (
                          <CircleIcon className="w-4 h-4 text-[#999999] flex-shrink-0" />
                        )}

                        <span
                          className={
                            item.done
                              ? "text-[#05073c]"
                              : "text-[#757575]"
                          }
                        >
                          {item.label}

                          {!item.done &&
                            " (pendiente)"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>

                {/* ACCESOS */}
                <div className="rounded-[14px] bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() =>
                      navigate(
                        ROUTES.MIS_POSTULACIONES
                      )
                    }
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
                  >
                    <BriefcaseIcon className="w-5 h-5 text-[#3351A6]" />

                    <span className="flex-1 font-semibold text-[#05073c] text-sm">
                      Mis postulaciones
                    </span>

                    <ChevronRightIcon className="w-4 h-4 text-[#999999] group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        ROUTES.HOME_CANDIDATO
                      )
                    }
                    className="w-full flex items-center gap-3 px-5 py-4 text-left border-t border-gray-100 hover:bg-gray-50 transition-colors group"
                  >
                    <SearchIcon className="w-5 h-5 text-[#3351A6]" />

                    <span className="flex-1 font-semibold text-[#05073c] text-sm">
                      Buscar ofertas
                    </span>

                    <ChevronRightIcon className="w-4 h-4 text-[#999999] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="flex flex-col gap-5">
                {/* HABILIDADES */}
                <SectionCard title="Habilidades">
                  {hasSkills ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[#eef3ff] text-[#3351A6] text-sm font-semibold px-3.5 py-1.5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#757575] text-sm">
                      Todavía no hay habilidades
                      cargadas.
                    </p>
                  )}
                </SectionCard>

                {/* EXPERIENCIA */}
                <SectionCard title="Experiencia">
                  {hasExperience ? (
                    <ol>
                      {experience.map(
                        (exp, index) => {
                          const isLast =
                            index ===
                            experience.length - 1;

                          const range =
                            formatRange(exp);

                          return (
                            <li
                              key={`${exp.job_name}-${exp.company_name}-${exp.start_date}-${index}`}
                              className="flex gap-4"
                            >
                              <div className="flex flex-col items-center">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                                    index === 0
                                      ? "bg-[#f46036]"
                                      : "bg-[#cfd3e6]"
                                  }`}
                                />

                                {!isLast && (
                                  <span className="w-px flex-1 bg-gray-200 mt-1" />
                                )}
                              </div>

                              <div
                                className={`min-w-0 ${
                                  isLast
                                    ? ""
                                    : "pb-5"
                                }`}
                              >
                                <p className="font-bold text-[#05073c] text-sm leading-tight">
                                  {exp.job_name ??
                                    "Puesto sin especificar"}
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
                        }
                      )}
                    </ol>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#d9d9d9] bg-[#fafafa] px-5 py-6 text-center">
                      <BriefcaseIcon className="w-5 h-5 text-[#999999] mx-auto mb-1.5" />

                      <p className="text-[#757575] text-sm">
                        Todavía no hay experiencia
                        cargada.
                      </p>
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  );
};