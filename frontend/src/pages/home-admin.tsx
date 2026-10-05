import React, { useState, useEffect, useMemo, type JSX } from 'react';
import {
  Menu as MenuIcon,
  Building2 as BuildingIcon,
  Briefcase as BriefcaseIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { ErrorMessage } from '../components/ui/error-message';
import { AdminSideMenu } from '../components/admin-side-menu';
import AuthService from '../services/auth.service';
import CompanyService from '../services/company.service';
import { apiService } from '../services/api.service';
import { API_CONFIG } from '../config/api.config';
import { ERROR_CODES } from '../constants/error-codes';
import type { Company } from '../types/employer.types';
import { getSectorLabel } from '../constants/sectors';

const CARD_CLASS = 'bg-white border border-[#dedede] shadow-sm rounded-xl';

// El color se asigna según la posición del sector (de más a menos ofertas)
const SECTOR_PALETTE = [
  '#f46036',
  '#3351A6',
  '#17835a',
  '#b45309',
  '#06083C',
  '#8a94c0',
];

const OTHERS_COLOR = '#c4c4c4';
const DONUT_MAX_SEGMENTS = 5;
const RATE_MAX_ROWS = 6;

// Forma real de la respuesta de getStats
interface StatsResponse {
  code: string;
  description: string;
  data?: {
    total_companies?: {
      number_of_companies?: number;
    }[];
    total_job_offers?: {
      number_of_job_offers?: number;
      business_sector?: Record<string, number>;
    };
    successful_job_offers?: {
      number_of_successful_job_offers?: number;
      business_sector?: Record<string, number>;
    };
  };
}

interface StatsData {
  totalCompanies: number;
  totalOffers: number;
  totalSuccess: number;
  offersBySector: Record<string, number>;
  successBySector: Record<string, number>;
}

interface StatTileProps {
  icon: JSX.Element;
  value: string;
  label: string;
  sublabel?: string;
}

const StatTile = ({
  icon,
  value,
  label,
  sublabel,
}: StatTileProps): JSX.Element => (
  <div className={`${CARD_CLASS} p-5 flex items-center gap-4`}>
    <div className="w-11 h-11 rounded-xl bg-[#eceef6] text-[#3b4a86] flex items-center justify-center flex-shrink-0">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="font-bold text-[#05073c] text-2xl leading-none tabular-nums">
        {value}
      </p>

      <p className="font-semibold text-[#05073c] text-sm mt-1">
        {label}
      </p>

      {sublabel && (
        <p className="text-[#666666] text-xs mt-0.5">
          {sublabel}
        </p>
      )}
    </div>
  </div>
);

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

const DonutChart = ({
  segments,
}: {
  segments: DonutSegment[];
}): JSX.Element => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center justify-center gap-8 min-h-[190px]">
      <svg
        width="120"
        height="120"
        viewBox="0 0 100 100"
        role="img"
        aria-label="Gráfico de dona de ofertas publicadas por sector"
        className="flex-shrink-0"
      >
        <g
          transform="rotate(-90 50 50)"
          fill="none"
          strokeWidth="16"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#eceef6"
          />

          {segments.map((seg) => {
            const length =
              total > 0
                ? (seg.value / total) * circumference
                : 0;

            const circle = (
              <circle
                key={seg.label}
                cx="50"
                cy="50"
                r={radius}
                stroke={seg.color}
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={-offset}
              />
            );

            offset += length;
            return circle;
          })}
        </g>

        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#05073c"
        >
          {total}
        </text>
      </svg>

      <ul className="flex flex-col gap-2 text-sm text-[#555555] min-w-0 w-[190px]">
        {segments.map((seg) => (
          <li
            key={seg.label}
            className="flex items-center gap-2"
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: seg.color }}
            />

            <span className="truncate flex-1">
              {seg.label}
            </span>

            <span className="font-semibold text-[#05073c] tabular-nums">
              {seg.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface RateBarProps {
  label: string;
  success: number;
  total: number;
  pct: number;
  color: string;
}

const RateBar = ({
  label,
  success,
  total,
  pct,
  color,
}: RateBarProps): JSX.Element => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[#555555] truncate">
        {label}
      </span>

      <span className="text-[#05073c] font-semibold tabular-nums whitespace-nowrap">
        {success} de {total} · {pct}%
      </span>
    </div>

    <div className="h-2.5 rounded-full bg-[#eceef6] overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
        }}
      />
    </div>
  </div>
);

export const HomeAdmin = (): JSX.Element => {
  const user = AuthService.getUser();
  const userId =
    user?.user_id != null
      ? String(user.user_id)
      : '';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estadísticas
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // Empresas
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState(false);
  const [search, setSearch] = useState('');

  // Se incrementa después de crear una empresa para recargar todo
  const [refreshKey, setRefreshKey] = useState(0);

  // Formulario de alta
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    taxId: false,
    description: false,
  });

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      if (!userId) {
        setStatsError(true);
        setStatsLoading(false);
        return;
      }

      try {
        // Se piden solo las secciones que usa esta pantalla
        const response = await apiService.post<StatsResponse>(
          API_CONFIG.ENDPOINTS.GET_STATS,
          {
            total_companies: true,
            total_job_offers: true,
            successful_job_offers: true,
          },
          { user_id: userId }
        );

        if (response.code !== ERROR_CODES.SUCCESS) {
          throw new Error(response.description);
        }

        const d = response.data ?? {};

        if (active) {
          setStats({
            totalCompanies:
              Number(
                d.total_companies?.[0]?.number_of_companies
              ) || 0,

            totalOffers:
              Number(
                d.total_job_offers?.number_of_job_offers
              ) || 0,

            totalSuccess:
              Number(
                d.successful_job_offers
                  ?.number_of_successful_job_offers
              ) || 0,

            offersBySector:
              d.total_job_offers?.business_sector ?? {},

            successBySector:
              d.successful_job_offers?.business_sector ?? {},
          });

          setStatsError(false);
        }
      } catch {
        if (active) {
          setStatsError(true);
        }
      } finally {
        if (active) {
          setStatsLoading(false);
        }
      }
    };

    const loadCompanies = async () => {
      if (!userId) {
        setCompaniesError(true);
        setCompaniesLoading(false);
        return;
      }

      try {
        const response =
          await CompanyService.getCompaniesList(userId);

        if (active) {
          setCompanies(
            (response.data || []) as Company[]
          );
          setCompaniesError(false);
        }
      } catch {
        if (active) {
          setCompaniesError(true);
        }
      } finally {
        if (active) {
          setCompaniesLoading(false);
        }
      }
    };

    void loadStats();
    void loadCompanies();

    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  const fmt = (
    n: number | null | undefined
  ): string =>
    n != null
      ? n.toLocaleString('es-AR')
      : '—';

  const successPct =
    stats && stats.totalOffers > 0
      ? Math.round(
        (stats.totalSuccess / stats.totalOffers) * 100
      )
      : null;

  // Sectores ordenados de más a menos ofertas,
  // con su tasa de éxito
  const sectorRows = useMemo(() => {
    if (!stats) return [];

    return Object.entries(stats.offersBySector)
      .map(([sector, total]) => ({
        key: sector,
        label: getSectorLabel(sector) ?? sector,
        total: Number(total) || 0,
        success:
          Number(
            stats.successBySector[sector]
          ) || 0,
      }))
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((row, index) => ({
        ...row,
        pct: Math.min(
          100,
          Math.round(
            (row.success / row.total) * 100
          )
        ),
        color:
          SECTOR_PALETTE[
          index % SECTOR_PALETTE.length
          ],
      }));
  }, [stats]);

  // Dona: los sectores principales y
  // el resto agrupado en "Otros"
  const donutSegments: DonutSegment[] =
    useMemo(() => {
      const main =
        sectorRows.slice(0, DONUT_MAX_SEGMENTS);

      const rest =
        sectorRows.slice(DONUT_MAX_SEGMENTS);

      const segments: DonutSegment[] =
        main.map((row) => ({
          label: row.label,
          value: row.total,
          color: row.color,
        }));

      if (rest.length > 0) {
        segments.push({
          label: 'Otros',
          value: rest.reduce(
            (sum, row) => sum + row.total,
            0
          ),
          color: OTHERS_COLOR,
        });
      }

      return segments;
    }, [sectorRows]);

  const visibleCompanies = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return [...companies]
      .filter(
        (c) =>
          !term ||
          c.name
            .toLowerCase()
            .includes(term)
      )
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          'es'
        )
      );
  }, [companies, search]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setFormError(null);
    setSuccess(false);

    const errors = {
      name: name.trim() === '',
      taxId: taxId.trim() === '',
      description:
        description.trim() === '',
    };

    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setSubmitting(true);

    try {
      await CompanyService.createNewCompany({
        name: name.trim(),
        description: description.trim(),
        tax_id: taxId.trim(),
      });

      setSuccess(true);
      setName('');
      setTaxId('');
      setDescription('');
      setRefreshKey(
        (key) => key + 1
      );
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la empresa.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#EFEFEF] w-full flex flex-col overflow-x-hidden min-h-screen">
      <nav className="flex w-full items-center gap-3 px-4 md:px-16 py-6 bg-[#05073c] shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setIsMenuOpen(true)
          }
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors duration-200"
        >
          <MenuIcon className="w-6 h-6 text-neutral-50" />
        </Button>

        <HeaderLogo />
      </nav>

      <AdminSideMenu
        isOpen={isMenuOpen}
        onClose={() =>
          setIsMenuOpen(false)
        }
      />

      <section className="w-full bg-[#1E2749] py-7 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 text-center">
          <h2 className="font-bold text-white text-xl md:text-2xl leading-tight">
            Panel de administración
          </h2>

          <p className="text-white/70 text-sm md:text-base mt-2 leading-relaxed">
            Administrá las empresas y supervisá el estado general de la plataforma.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-5 px-4 md:px-20 py-8 w-full max-w-[1194px] mx-auto">
        {statsError && (
          <div className="bg-[#fff4ed] border border-[#f46036]/30 text-[#a83f1c] text-sm rounded-[8px] px-5 py-3">
            No pudimos cargar las estadísticas.
            Verificá que el usuario tenga permisos
            de administrador.
          </div>
        )}

        {/* Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile
            icon={
              <BuildingIcon className="w-5 h-5" />
            }
            value={
              statsLoading
                ? '—'
                : fmt(stats?.totalCompanies)
            }
            label="Empresas"
            sublabel="Registradas en la plataforma"
          />

          <StatTile
            icon={
              <BriefcaseIcon className="w-5 h-5" />
            }
            value={
              statsLoading
                ? '—'
                : fmt(stats?.totalOffers)
            }
            label="Ofertas publicadas"
            sublabel="Total acumulado"
          />

          <StatTile
            icon={
              <TrendingUpIcon className="w-5 h-5" />
            }
            value={
              statsLoading
                ? '—'
                : fmt(stats?.totalSuccess)
            }
            label="Ofertas conseguidas"
            sublabel={
              successPct != null
                ? `${successPct}% de éxito`
                : undefined
            }
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            className={`${CARD_CLASS} p-6`}
          >
            <h3 className="font-bold text-[#05073c] text-base mb-1">
              Ofertas publicadas por sector
            </h3>

            <p className="text-[#757575] text-xs mb-5">
              Distribución según el sector de cada oferta
            </p>

            {statsLoading ? (
              <p className="text-[#757575] text-sm">
                Cargando...
              </p>
            ) : sectorRows.length === 0 ? (
              <p className="text-[#757575] text-sm">
                Sin datos disponibles.
              </p>
            ) : (
              <DonutChart
                segments={donutSegments}
              />
            )}
          </div>

          <div
            className={`${CARD_CLASS} p-6`}
          >
            <h3 className="font-bold text-[#05073c] text-base mb-1">
              Tasa de éxito por sector
            </h3>

            <p className="text-[#757575] text-xs mb-5">
              Los sectores con más ofertas publicadas
            </p>

            {statsLoading ? (
              <p className="text-[#757575] text-sm">
                Cargando...
              </p>
            ) : sectorRows.length === 0 ? (
              <p className="text-[#757575] text-sm">
                Sin datos disponibles.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {sectorRows
                  .slice(0, RATE_MAX_ROWS)
                  .map((row) => (
                    <RateBar
                      key={row.key}
                      label={row.label}
                      success={row.success}
                      total={row.total}
                      pct={row.pct}
                      color={row.color}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Empresas: lista + alta, siempre visible */}
        <div
          className={`${CARD_CLASS} overflow-hidden`}
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#f0f0f0]">
            <h3 className="font-bold text-[#05073c] text-base">
              Empresas
            </h3>

            {!companiesLoading &&
              !companiesError && (
                <span className="rounded-full bg-[#eceef6] px-2 py-0.5 text-xs font-semibold text-[#3b4a86]">
                  {companies.length}
                </span>
              )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
            {/* Lista */}
            <div className="flex flex-col p-5 gap-3 min-w-0">
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />

                <Input
                  id="company-search"
                  name="company-search"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Buscar empresa"
                  className="h-auto min-h-[40px] bg-white rounded-lg border border-[#d9d9d9] pl-9 pr-3 py-2 text-sm"
                />
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {companiesLoading ? (
                  <p className="py-6 text-center text-sm text-[#757575]">
                    Cargando empresas...
                  </p>
                ) : companiesError ? (
                  <p className="py-6 text-center text-sm text-[#f46036]">
                    No pudimos cargar las empresas.
                    Volvé a intentar más tarde.
                  </p>
                ) : visibleCompanies.length ===
                  0 ? (
                  <p className="py-6 text-center text-sm text-[#757575]">
                    {search.trim()
                      ? 'Ninguna empresa coincide con la búsqueda.'
                      : 'Todavía no hay empresas registradas.'}
                  </p>
                ) : (
                  visibleCompanies.map(
                    (company) => (
                      <div
                        key={company.company_id}
                        className="flex items-center gap-3 py-3 border-t border-[#f0f0f0] first:border-t-0"
                      >
                        <div className="w-9 h-9 rounded-[9px] bg-[#eceef6] text-[#3b4a86] flex items-center justify-center flex-shrink-0">
                          <BuildingIcon className="w-[18px] h-[18px]" />
                        </div>

                        <p className="font-semibold text-[#05073c] text-sm truncate">
                          {company.name}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* Alta */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 p-5 bg-[#fafafa] border-t lg:border-t-0 lg:border-l border-[#f0f0f0]"
            >
              <h4 className="font-bold text-[#05073c] text-sm">
                Dar de alta una empresa
              </h4>

              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-lg text-sm">
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                  Empresa creada correctamente.
                </div>
              )}

              {formError && (
                <ErrorMessage
                  message={formError}
                />
              )}

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="company-name"
                  className="font-normal text-sm"
                >
                  Nombre{' '}
                  <span className="text-[#cc2222]">
                    *
                  </span>
                </Label>

                <Input
                  id="company-name"
                  name="name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  disabled={submitting}
                  className="h-auto min-h-[40px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 text-sm"
                />

                {fieldErrors.name && (
                  <p className="text-[#cc2222] text-xs">
                    El nombre es obligatorio
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="company-tax-id"
                  className="font-normal text-sm"
                >
                  CUIT{' '}
                  <span className="text-[#cc2222]">
                    *
                  </span>
                </Label>

                <Input
                  id="company-tax-id"
                  name="tax_id"
                  value={taxId}
                  onChange={(e) =>
                    setTaxId(e.target.value)
                  }
                  disabled={submitting}
                  className="h-auto min-h-[40px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 text-sm"
                />

                {fieldErrors.taxId && (
                  <p className="text-[#cc2222] text-xs">
                    El CUIT es obligatorio
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="company-description"
                  className="font-normal text-sm"
                >
                  Descripción{' '}
                  <span className="text-[#cc2222]">
                    *
                  </span>
                </Label>

                <textarea
                  id="company-description"
                  name="description"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  disabled={submitting}
                  className="min-h-[80px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#f46036] focus:border-transparent transition-all"
                />

                {fieldErrors.description && (
                  <p className="text-[#cc2222] text-xs">
                    La descripción es obligatoria
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-lg bg-[#f46036] hover:bg-[#d9512e] px-6 font-medium text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting
                  ? 'Creando...'
                  : 'Crear empresa'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};