import { EyeOff, Eye } from "lucide-react";
import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { HeaderLogo } from "../components/ui/header-logo";
import { ErrorMessage } from "../components/ui/error-message";
import JSEncrypt from "jsencrypt";
import CandidatoService from "../services/candidato.service";
import { apiService } from "../services/api.service";
import { API_CONFIG } from "../config/api.config";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export const RegistroCandidato = (): JSX.Element => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cvLink, setCvLink] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordFormatError, setPasswordFormatError] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const [cvError, setCvError] = useState(false);
  const [skillsError, setSkillsError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [skillOptions, setSkillOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillsLoadError, setSkillsLoadError] = useState<string | null>(null);

  const availableSkills = skillOptions.filter(
    (option) => !selectedSkills.includes(option.value)
  );

  interface Skill {
    skill_id: number;
    name: string;
  }

  useEffect(() => {
  const loadSkills = async () => {
    try {
      setLoadingSkills(true);
      setSkillsLoadError(null);

      const response = await apiService.post<{
        code: string;
        description: string;
        data: Skill[];
      }>(API_CONFIG.ENDPOINTS.GET_SKILLS_LIST, {});

      console.log('Skills API Response:', response);

      if (response.code !== '0200') {
        throw new Error(response.description || 'Error al cargar habilidades');
      }

      if (response.data && Array.isArray(response.data)) {
        const formattedSkills = response.data.map((skill) => ({
          value: skill.skill_id.toString(),
          label: skill.name, // ✅ ahora sí se ve HTML, CSS, etc
        }));
        console.log('Formatted skills:', formattedSkills);
        setSkillOptions(formattedSkills);
      }
    } catch (err) {
      console.error('Error loading skills:', err);
      setSkillsLoadError('Error al cargar las habilidades. Por favor, recargá la página.');
    } finally {
      setLoadingSkills(false);
    }
  };

  loadSkills();
}, []);

  const handleSkillSelect = (value: string) => {
    if (!selectedSkills.includes(value)) setSelectedSkills([...selectedSkills, value]);
  };

  const handleSkillRemove = (value: string) => {
    setSelectedSkills(selectedSkills.filter((skill) => skill !== value));
  };

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleCvLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCvLink(value);
    if (value.trim() === "") setCvError(false);
    else setCvError(!isValidUrl(value));
  };

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

    if (cvLink.trim() === "" || !isValidUrl(cvLink) || cvLink.length > 100) {
      setCvError(true);
      hasError = true;
    } else setCvError(false);

    if (selectedSkills.length < 1) {
      setSkillsError(true);
      hasError = true;
    } else setSkillsError(false);

    if (hasError) return;

    setLoading(true);

    try {
      const encryptedPassword = encryptPassword(password);

      const requestBody = {
        name: name.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: encryptedPassword,
        resume_url: cvLink.trim(),
        skill_list: selectedSkills.map((s) => parseInt(s)),
      };

      await CandidatoService.registerCandidate(requestBody);

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
          <span className="font-bold">Creá tu cuenta como candidato </span>
          <span className="font-normal">y accedé a ofertas laborales</span>
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
              {nameError && <p className="[font-family:'Nunito',Helvetica] text-[#cc2222] text-sm mt-1">Nombre obligatorio, máximo 20 caracteres</p>}
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
              {lastNameError && <p className="[font-family:'Nunito',Helvetica] text-[#cc2222] text-sm mt-1">Apellido obligatorio, máximo 20 caracteres</p>}
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
            {emailError && <p className="[font-family:'Nunito',Helvetica] text-[#cc2222] text-sm mt-1">Email obligatorio, máximo 60 caracteres</p>}
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
                  <div className="[font-family:'Nunito',Helvetica] text-[#cc2222] text-sm mt-1">
                    {passwordFormatError && <p>La contraseña debe tener máximo 30 caracteres</p>}
                    {passwordMismatchError && <p>Las contraseñas no coinciden</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
              Currículum (URL) <span className="text-[#cc2222]">*</span>
            </Label>
            <Input
              value={cvLink}
              onChange={handleCvLinkChange}
              placeholder="Link a tu CV en PDF o Drive"
              className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
              maxLength={100}
              disabled={loading}
            />
            {cvError && <p className="[font-family:'Nunito',Helvetica] text-[#cc2222] text-sm mt-1">Ingresá un link válido (http o https), máximo 100 caracteres</p>}
          </div>

          <div className="flex flex-col gap-[5px]">
            <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
              Habilidades <span className="text-[#cc2222]">*</span>
            </Label>
            {skillsLoadError ? (
              <div className="h-auto min-h-[42px] bg-white rounded-lg border border-[#cc2222] px-4 py-2 flex items-center">
                <p className="[font-family:'Nunito',Helvetica] font-normal text-sm text-[#cc2222]">
                  {skillsLoadError}
                </p>
              </div>
            ) : (
              <Select onValueChange={handleSkillSelect} disabled={loadingSkills || loading} value="">
                <SelectTrigger className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 [font-family:'Nunito',Helvetica] font-normal text-base text-[#b3b3b3]">
                  <SelectValue placeholder={loadingSkills ? "Cargando habilidades..." : "Seleccioná habilidades"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingSkills ? (
                    <div className="px-2 py-1.5 text-sm text-[#757575] [font-family:'Nunito',Helvetica]">
                      Cargando...
                    </div>
                  ) : availableSkills.length > 0 ? (
                    availableSkills.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="[font-family:'Nunito',Helvetica]">
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-[#757575] [font-family:'Nunito',Helvetica]">
                      {skillOptions.length === 0 ? 'No hay habilidades disponibles' : 'Todas las habilidades seleccionadas'}
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedSkills.map((skillValue) => {
                  const skill = skillOptions.find((s) => s.value === skillValue);
                  return (
                    <div
                      key={skillValue}
                      className="bg-[#0088FF] text-white px-3 py-1.5 rounded-md flex items-center gap-2 [font-family:'Nunito',Helvetica] font-normal text-base"
                    >
                      <span>{skill?.label}</span>
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skillValue)}
                        className="hover:opacity-80 transition-opacity"
                        aria-label={`Eliminar ${skill?.label}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {skillsError && <p className="[font-family:'Nunito',Helvetica] text-[#cc2222] text-sm mt-1">Debés seleccionar al menos 1 habilidad</p>}
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
