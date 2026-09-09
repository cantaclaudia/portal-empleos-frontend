import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Bone as XIcon, Home as HomeIcon, Plus as PlusIcon, Briefcase as BriefcaseIcon, Users as UsersIcon, Settings as SettingsIcon, User as UserIcon, ChevronLeft as ChevronLeftIcon, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { ErrorMessage } from '../components/ui/error-message';
import AuthService from '../services/auth.service';
import CompanyService from '../services/company.service';
import { ROUTES } from '../routes';

export const AltaEmpresa: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taxId, setTaxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [descError, setDescError] = useState(false);
  const [taxIdError, setTaxIdError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    let hasError = false;
    if (name.trim() === '') { setNameError(true); hasError = true; } else setNameError(false);
    if (description.trim() === '') { setDescError(true); hasError = true; } else setDescError(false);
    if (taxId.trim() === '') { setTaxIdError(true); hasError = true; } else setTaxIdError(false);
    if (hasError) return;

    setLoading(true);
    try {
      await CompanyService.createNewCompany({
        name: name.trim(),
        description: description.trim(),
        tax_id: taxId.trim(),
      });
      setSuccess(true);
      setName('');
      setDescription('');
      setTaxId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la empresa.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Inicio', path: ROUTES.HOME_RECLUTADOR },
    { icon: PlusIcon, label: 'Crear nueva oferta', path: ROUTES.CREAR_OFERTA },
    { icon: BriefcaseIcon, label: 'Alta empresa', path: ROUTES.ALTA_EMPRESA },
    { icon: UsersIcon, label: 'Postulaciones recibidas', path: ROUTES.POSTULACIONES_RECIBIDAS },
    { icon: SettingsIcon, label: 'Configuración', path: ROUTES.HOME_RECLUTADOR },
  ];

  return (
    <div className="bg-[#EFEFEF] w-full min-h-screen flex flex-col">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] relative z-50">
        <Button variant="ghost" size="icon" className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors" onClick={() => setIsMenuOpen(true)}>
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>
        <HeaderLogo />
      </nav>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[320px] bg-[#06083C] z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-end p-5">
              <button onClick={() => setIsMenuOpen(false)} className="text-white hover:bg-white/10 rounded p-1 transition-colors">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-4 px-6 pb-6 border-b border-white/20">
              <div className="w-12 h-12 rounded-full bg-[#f46036] flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-white text-base">{user ? `${user.first_name} ${user.last_name}` : ''}</p>
                <p className="font-normal text-white/70 text-sm">Reclutador</p>
              </div>
            </div>
            <div className="flex flex-col py-4">
              {menuItems.map((item) => (
                <button key={item.label} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="flex items-center gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors">
                  <item.icon className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="font-normal text-white text-base">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-auto border-t border-white/20">
              <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors w-full">
                <span className="font-normal text-white text-base">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}

      <section className="w-full bg-[#1E2749] py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <button onClick={() => navigate(ROUTES.HOME_RECLUTADOR)} className="flex items-center gap-1 text-white/80 text-sm font-medium hover:text-white transition-colors mb-4">
            <ChevronLeftIcon className="w-4 h-4" /> Volver al inicio
          </button>
          <h1 className="font-bold text-white text-2xl md:text-3xl">Alta empresa</h1>
        </div>
      </section>

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          {success && (
            <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Empresa creada correctamente.</span>
            </div>
          )}
          {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">Nombre de empresa <span className="text-[#cc2222]">*</span></Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa el nombre de la empresa"
                className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
                disabled={loading}
              />
              {nameError && <p className="text-[#cc2222] text-sm">El nombre es obligatorio</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">Descripción <span className="text-[#cc2222]">*</span></Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingresa una descripción de la empresa"
                className="h-auto min-h-[80px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 font-normal text-base text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#f46036] focus:border-transparent transition-all"
                disabled={loading}
              />
              {descError && <p className="text-[#cc2222] text-sm">La descripción es obligatoria</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-normal text-sm">CUIT / Identificación fiscal <span className="text-[#cc2222]">*</span></Label>
              <Input
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Ej: 3077777019"
                className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
                disabled={loading}
              />
              {taxIdError && <p className="text-[#cc2222] text-sm">La identificación fiscal es obligatoria</p>}
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-12 rounded-lg bg-[#f46036] hover:bg-[#d9512e] px-12 py-3 font-medium text-white text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creando...' : 'Crear empresa'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};
