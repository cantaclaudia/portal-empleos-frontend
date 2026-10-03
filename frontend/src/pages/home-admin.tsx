import React, { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Building2 as BuildingIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { AdminSideMenu } from '../components/admin-side-menu';
import AuthService from '../services/auth.service';
import StatsService from '../services/stats.service';
import { ROUTES } from '../routes';

interface StatCardProps {
  icon: JSX.Element;
  value: string;
  label: string;
  sublabel?: string;
}

const StatCard = ({ icon, value, label, sublabel }: StatCardProps): JSX.Element => (
  <div className="bg-white rounded-[14px] border border-gray-100 p-6 flex flex-col gap-3">
    <div className="w-10 h-10 rounded-[10px] bg-[#eceef6] text-[#3b4a86] flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="font-bold text-[#05073c] text-3xl leading-none">{value}</p>
      <p className="font-semibold text-[#05073c] text-sm mt-1">{label}</p>
      {sublabel && <p className="text-[#666666] text-xs mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

interface SectorBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const SectorBar = ({ label, value, total, color }: SectorBarProps): JSX.Element => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 text-[#666666] flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-[#eceef6] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-8 text-right font-bold text-[#05073c]">{value}</span>
    </div>
  );
};

const SECTOR_LABELS: Record<string, string> = {
  technology: 'Tecnología',
  law: 'Derecho',
  accounting: 'Contabilidad',
  science: 'Ciencias',
};

const SECTOR_COLORS: Record<string, string> = {
  technology: '#f46036',
  law: '#3b4a86',
  accounting: '#17835a',
  science: '#b45309',
};

type RawStats = Awaited<ReturnType<typeof StatsService.getRawStats>>;

export const HomeAdmin = (): JSX.Element => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Administrador';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [data, setData] = useState<RawStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await StatsService.getRawStats();
        if (active) setData(result);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const fmt = (n: number | null | undefined): string =>
    n != null ? n.toLocaleString('es-AR') : '—';

  const successPct =
    data && data.total_job_offers_sum > 0
      ? Math.round((data.successful_job_offers_sum / data.total_job_offers_sum) * 100)
      : null;

  return (
    <div className="bg-[#EFEFEF] w-full flex flex-col overflow-x-hidden min-h-screen">
      <nav className="flex w-full items-center gap-3 px-4 md:px-16 py-6 bg-[#05073c] shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors duration-200"
        >
          <MenuIcon className="w-6 h-6 text-neutral-50" />
        </Button>
        <HeaderLogo />
      </nav>

      <AdminSideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="px-4 md:px-20 py-7 bg-gradient-to-r from-[#1e2749] to-[#2a3558] text-white">
        <h2 className="font-bold text-xl md:text-2xl">Hola, {userName}</h2>
        <p className="text-white/80 text-sm mt-1">Panel de administración</p>
      </section>

      <section className="flex flex-col gap-6 px-4 md:px-20 py-8 w-full max-w-[1194px] mx-auto">
        {error && (
          <div className="bg-[#fff4ed] border border-[#f46036]/30 text-[#a83f1c] text-sm rounded-[8px] px-5 py-3">
            No pudimos cargar las estadísticas. Verificá que el usuario tenga permisos de administrador.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<UsersIcon className="w-5 h-5" />}
            value={loading ? '—' : fmt(data?.total_companies)}
            label="Empresas"
            sublabel="Registradas en la plataforma"
          />
          <StatCard
            icon={<BuildingIcon className="w-5 h-5" />}
            value={loading ? '—' : fmt(data?.total_job_offers_sum)}
            label="Ofertas publicadas"
            sublabel="Total acumulado"
          />
          <StatCard
            icon={<TrendingUpIcon className="w-5 h-5" />}
            value={loading ? '—' : fmt(data?.successful_job_offers_sum)}
            label="Ofertas conseguidas"
            sublabel={successPct != null ? `${successPct}% de éxito` : undefined}
          />
          <StatCard
            icon={<BriefcaseIcon className="w-5 h-5" />}
            value="—"
            label="Candidatos"
            sublabel="Pendiente en el back"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[14px] border border-gray-100 p-6">
            <h3 className="font-bold text-[#05073c] text-base mb-5">
              Ofertas publicadas por sector
            </h3>
            {loading ? (
              <p className="text-[#757575] text-sm">Cargando...</p>
            ) : data?.total_job_offers.length === 0 ? (
              <p className="text-[#757575] text-sm">Sin datos disponibles.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {(data?.total_job_offers ?? []).map((s) => (
                  <SectorBar
                    key={s.company_type}
                    label={SECTOR_LABELS[s.company_type] ?? s.company_type}
                    value={s.sector_count}
                    total={data?.total_job_offers_sum ?? 0}
                    color={SECTOR_COLORS[s.company_type] ?? '#3b4a86'}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[14px] border border-gray-100 p-6">
            <h3 className="font-bold text-[#05073c] text-base mb-5">
              Ofertas conseguidas por sector
            </h3>
            {loading ? (
              <p className="text-[#757575] text-sm">Cargando...</p>
            ) : data?.successful_job_offers.length === 0 ? (
              <p className="text-[#757575] text-sm">Sin datos disponibles.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {(data?.successful_job_offers ?? []).map((s) => (
                  <SectorBar
                    key={s.bussines_sector}
                    label={SECTOR_LABELS[s.bussines_sector] ?? s.bussines_sector}
                    value={s.successful_job_offer_count}
                    total={data?.total_job_offers_sum ?? 0}
                    color={SECTOR_COLORS[s.bussines_sector] ?? '#3b4a86'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[14px] border border-gray-100 p-6">
          <h3 className="font-bold text-[#05073c] text-base mb-2">Accesos rápidos</h3>
          <p className="text-[#666666] text-sm mb-5">
            Operaciones disponibles para el administrador.
          </p>
          <button
            onClick={() => navigate(ROUTES.ALTA_EMPRESA)}
            className="inline-flex items-center gap-2.5 bg-[#f46036] hover:bg-[#d9512e] text-white font-semibold text-sm px-5 py-3 rounded-[10px] transition-colors"
          >
            <BuildingIcon className="w-4 h-4" />
            Dar de alta una empresa
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};