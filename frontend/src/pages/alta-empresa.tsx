import React, { useState } from 'react';
import { Menu as MenuIcon, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { HeaderLogo } from '../components/ui/header-logo';
import { Footer } from '../components/ui/footer';
import { ErrorMessage } from '../components/ui/error-message';
import { AdminSideMenu } from '../components/admin-side-menu';
import CompanyService from '../services/company.service';

export const AltaEmpresa: React.FC = () => {
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

  return (
    <div className="bg-[#EFEFEF] w-full min-h-screen flex flex-col">
      <nav className="flex w-full items-center gap-3 px-4 md:px-8 lg:px-[62px] py-4 md:py-5 bg-[#06083C] relative z-50">
        <Button variant="ghost" size="icon" className="h-auto w-auto p-1.5 hover:bg-white/10 rounded transition-colors" onClick={() => setIsMenuOpen(true)}>
          <MenuIcon className="w-6 h-6 text-white" />
        </Button>
        <HeaderLogo />
      </nav>

      <AdminSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <section className="w-full bg-[#1E2749] py-6 md:py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
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