import { EyeOff, Eye } from "lucide-react";
import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { HeaderLogo } from "../components/ui/header-logo";
import { ErrorMessage } from "../components/ui/error-message";
import JSEncrypt from "jsencrypt";
import { API_CONFIG } from "../config/api.config";
import { ENDPOINT_ERROR_MESSAGES, ERROR_CODES, COMMON_ERROR_MESSAGES } from "../constants/error-codes";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../components/ui/select";

export const RegistroReclutador = (): JSX.Element => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordFormatError, setPasswordFormatError] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const [companyError, setCompanyError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyOptions, setCompanyOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesLoadError, setCompaniesLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        setCompaniesLoadError(null);

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_COMPANIES_LIST}`, {
          method: 'POST',
          headers: {
            'x-access-token': API_CONFIG.TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        const result = await response.json();

        if (result.code === ERROR_CODES.SUCCESS && Array.isArray(result.data)) {
          const formattedCompanies = result.data.map(
            (company: { company_id: number; name: string }) => ({
              value: company.company_id.toString(),
              label: company.name,
            })
          );
          setCompanyOptions(formattedCompanies);
        } else {
          const message =
            ENDPOINT_ERROR_MESSAGES.GET_COMPANIES[result.code as keyof typeof ENDPOINT_ERROR_MESSAGES.GET_COMPANIES]
            ?? result.description
            ?? COMMON_ERROR_MESSAGES.DEFAULT;
          setCompaniesLoadError(message);
        }
      } catch (err) {
        console.error("Error loading companies:", err);
        setCompaniesLoadError(COMMON_ERROR_MESSAGES.CONNECTION_ERROR);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/[!"#$%/()=?¡¨*[\];:_¿´+{},.\-><°|¬\\~`^Ññ\r\n]/g, "")
      .slice(0, 30);
    setPassword(value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/[!"#$%/()=?¡¨*[\];:_¿´+{},.\-><°|¬\\~`^Ññ\r\n]/g, "")
      .slice(0, 30);
    setConfirmPassword(value);
  };

  const encryptPassword = (password: string) => {
    const publicKey = import.meta.env.VITE_RSA_PUBLIC_KEY;

    if (!publicKey) return password;

    try {
      const jsEncrypt = new JSEncrypt();
      jsEncrypt.setPublicKey(publicKey);
      return jsEncrypt.encrypt(password) || password;
    } catch {
      return password;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    let hasError = false;
    setNameError(false);
    setLastNameError(false);
    setEmailError(false);
    setPasswordFormatError(false);
    setPasswordMismatchError(false);
    setCompanyError(false);

    if (name.trim() === "" || name.length > 20) {
      setNameError(true);
      hasError = true;
    }
    if (lastName.trim() === "" || lastName.length > 20) {
      setLastNameError(true);
      hasError = true;
    }
    if (email.trim() === "" || email.length > 60) {
      setEmailError(true);
      hasError = true;
    }
    if (password.trim() === "" || password.length > 30) {
      setPasswordFormatError(true);
      hasError = true;
    }
    if (password !== confirmPassword) {
      setPasswordMismatchError(true);
      hasError = true;
    }
    if (companyId.trim() === "") {
      setCompanyError(true);
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);

    try {
      const encryptedPassword = encryptPassword(password);

      const requestBody = {
        name: name.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: encryptedPassword,
        company_id: companyId,
      };

      console.log('Sending employer registration:', requestBody);

      const response = await fetch(`${API_CONFIG.BASE_URL}/registerEmployerUser`, {
        method: 'POST',
        headers: {
          'x-access-token': API_CONFIG.TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      console.log('Registration API Response:', result);

      if (result.code === ERROR_CODES.SUCCESS) {
        navigate('/login');
      } else {
        const message =
          ENDPOINT_ERROR_MESSAGES.REGISTER_EMPLOYER[result.code as keyof typeof ENDPOINT_ERROR_MESSAGES.REGISTER_EMPLOYER] ||
          result.description ||
          ENDPOINT_ERROR_MESSAGES.REGISTER_EMPLOYER[ERROR_CODES.INTERNAL_ERROR];
        throw new Error(message);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f2f2f2] w-full min-h-screen flex flex-col">
      <header className="w-full bg-[#05073c] px-6 md:px-[50px] py-4">
        <div className="flex items-center justify-start">
          <HeaderLogo />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-12">
        <h2 className="[font-family:'Nunito',Helvetica] text-[#05073c] text-[28px] md:text-[32px] leading-tight mb-12 text-center">
          <span className="font-bold">Creá tu cuenta como empresa </span>
          <span className="font-normal">y publicá ofertas laborales</span>
        </h2>

        {error && <ErrorMessage message={error} />}

        <form className="flex flex-col gap-8 max-w-[928px] mx-auto" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-[5px]">
              <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
                Nombre <span className="text-[#cc2222]">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu/s nombre/s"
                className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
                maxLength={20}
                disabled={loading}
              />
              {nameError && <p className="text-[#cc2222] text-sm mt-1">Nombre obligatorio, máximo 20 caracteres</p>}
            </div>

            <div className="flex flex-col gap-[5px]">
              <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
                Apellido <span className="text-[#cc2222]">*</span>
              </Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ingresa tu/s apellido/s"
                className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
                maxLength={20}
                disabled={loading}
              />
              {lastNameError && <p className="text-[#cc2222] text-sm mt-1">Apellido obligatorio, máximo 20 caracteres</p>}
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
              Correo electrónico <span className="text-[#cc2222]">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
              maxLength={60}
              disabled={loading}
            />
            {emailError && <p className="text-[#cc2222] text-sm mt-1">Email obligatorio, máximo 60 caracteres</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-[5px]">
              <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
                Contraseña <span className="text-[#cc2222]">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Creá una contraseña segura"
                  className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 pr-10"
                  maxLength={30}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#333333] transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
                Repetir contraseña <span className="text-[#cc2222]">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirmá tu contraseña"
                  className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 pr-10"
                  maxLength={30}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#333333] transition-colors"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

                {(passwordFormatError || passwordMismatchError) && (
                  <div className="text-[#cc2222] text-sm mt-1">
                    {passwordFormatError && <p>La contraseña debe tener máximo 30 caracteres</p>}
                    {passwordMismatchError && <p>Las contraseñas no coinciden</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
              Empresa <span className="text-[#cc2222]">*</span>
            </Label>
            {companiesLoadError ? (
              <div className="h-auto min-h-[42px] bg-white rounded-lg border border-[#cc2222] px-4 py-2 flex items-center">
                <p className="[font-family:'Nunito',Helvetica] font-normal text-sm text-[#cc2222]">
                  {companiesLoadError}
                </p>
              </div>
            ) : (
              <Select
                value={companyId}
                onValueChange={setCompanyId}
                disabled={loadingCompanies || loading}
              >
                <SelectTrigger className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 font-normal text-base text-[#b3b3b3]">
                  {companyId
                    ? companyOptions.find(option => option.value === companyId)?.label
                    : loadingCompanies
                      ? "Cargando empresas..."
                      : "Seleccioná tu empresa"}
                </SelectTrigger>
                <SelectContent>
                  {loadingCompanies ? (
                    <div className="px-2 py-1.5 text-sm text-[#757575]">Cargando...</div>
                  ) : companyOptions.length > 0 ? (
                    companyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-[#757575]">No hay empresas disponibles</div>
                  )}
                </SelectContent>
              </Select>
            )}
            {companyError && <p className="text-[#cc2222] text-sm mt-1">Debés seleccionar una empresa</p>}
          </div>

          <div className="flex flex-col items-center gap-6 mt-4">
            <Button
              type="submit"
              disabled={loading}
              className="h-auto bg-[#f46036] hover:bg-[#f46036]/90 rounded-lg px-12 py-2.5 [font-family:'Nunito',Helvetica] font-medium text-white text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>

            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-[928px] gap-4 md:gap-8 px-4">
              <p className="[font-family:'Nunito',Helvetica] text-[16px] md:text-[18px] leading-[28px] text-center md:text-left">
                <span className="text-[#2f2d38]">¿Ya tenés cuenta? </span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#0088ff] hover:underline bg-transparent border-0 cursor-pointer [font-family:'Nunito',Helvetica] font-medium"
                >
                  Iniciá sesión
                </button>
              </p>

              <p className="[font-family:'Nunito',Helvetica] text-[16px] md:text-[18px] leading-[28px] text-center md:text-right">
                <span className="text-[#2f2d38]">¿Sos candidato? </span>
                <button
                  type="button"
                  onClick={() => navigate('/registro-candidato')}
                  className="text-[#0088ff] hover:underline bg-transparent border-0 cursor-pointer [font-family:'Nunito',Helvetica] font-medium"
                >
                  Crear cuenta
                </button>
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
