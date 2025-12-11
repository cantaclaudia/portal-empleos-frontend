import { EyeOff, Eye } from "lucide-react";
import React, { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { HeaderLogo } from "../components/ui/header-logo";
import { ErrorMessage } from "../components/ui/error-message";
import JSEncrypt from "jsencrypt";
import EmployerService from "../services/employer.service";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

  const companyOptions = [
    { value: "1", label: "Empresa 1" },
    { value: "2", label: "Empresa 2" },
    { value: "3", label: "Empresa 3" },
    { value: "4", label: "Empresa 4" },
  ];

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

    if (!publicKey) {
      console.warn('No RSA public key found, password will be sent as plain text');
      return password;
    }

    try {
      const jsEncrypt = new JSEncrypt();
      jsEncrypt.setPublicKey(publicKey);
      const encrypted = jsEncrypt.encrypt(password);
      return encrypted || password;
    } catch (error) {
      console.error('Error encrypting password:', error);
      return password;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    let hasError = false;

    if (name.trim() === "" || name.length > 20) {
      setNameError(true);
      hasError = true;
    } else setNameError(false);

    if (lastName.trim() === "" || lastName.length > 20) {
      setLastNameError(true);
      hasError = true;
    } else setLastNameError(false);

    if (email.trim() === "" || email.length > 60) {
      setEmailError(true);
      hasError = true;
    } else setEmailError(false);

    if (password.trim() === "" || password.length > 30) {
      setPasswordFormatError(true);
      hasError = true;
    } else setPasswordFormatError(false);

    if (password !== confirmPassword) {
      setPasswordMismatchError(true);
      hasError = true;
    } else setPasswordMismatchError(false);

    if (companyId.trim() === "") {
      setCompanyError(true);
      hasError = true;
    } else setCompanyError(false);

    if (hasError) return;

    setLoading(true);

    try {
      const encryptedPassword = encryptPassword(password);

      const requestBody = {
        name: name.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: encryptedPassword,
        company_id: parseInt(companyId),
      };

      await EmployerService.registerEmployer(requestBody);

      navigate('/login');
    } catch (err) {
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

        {error && (
          <div className="max-w-[928px] mx-auto mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

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
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 [font-family:'Nunito',Helvetica] font-normal text-base text-[#b3b3b3]">
                <SelectValue placeholder="Seleccioná tu empresa" />
              </SelectTrigger>
              <SelectContent>
                {companyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

            <div className="text-center">
              <p className="[font-family:'Nunito',Helvetica] text-[18px] leading-[28px]">
                <span className="text-[#2f2d38]">¿Ya tenés cuenta? </span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#0088ff] hover:underline bg-transparent border-0 cursor-pointer [font-family:'Nunito',Helvetica]"
                >
                  Iniciá sesión
                </button>
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
