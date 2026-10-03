import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ErrorMessage } from "../components/ui/error-message";
import JSEncrypt from "jsencrypt";
import CandidateService from "../services/candidate.service";
import { apiService } from "../services/api.service";
import { API_CONFIG } from "../config/api.config";
import type { ErrorCode } from "../constants/error-codes";
import errorHandler from "../services/error-handler.service";
import validator from 'validator';
import {
  RegistroLayout,
  FormSection,
  Field,
  PasswordInput,
  inputClass,
} from "../components/registro-layout"; // NUEVO

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface Skill {
  skill_id: number;
  name: string;
}

interface SkillsResponse {
  code: ErrorCode;
  description?: string;
  data: Skill[];
}

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

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoadingSkills(true);
        setSkillsLoadError(null);

        const response = await apiService.post<SkillsResponse>(
          API_CONFIG.ENDPOINTS.GET_SKILLS_LIST,
          {}
        );

        console.log('Skills API Response:', response);

        if (!errorHandler.isSuccess(response.code)) {
          errorHandler.handleApiError(response, 'GET_SKILLS');
        }

        if (response.data && Array.isArray(response.data)) {
          const formattedSkills = response.data.map((skill) => ({
            value: skill.skill_id.toString(),
            label: skill.name,
          }));
          console.log('Formatted skills:', formattedSkills);
          setSkillOptions(formattedSkills);
        }
      } catch (err) {
        console.error('Error loading skills:', err);

        setSkillsLoadError(
          err instanceof Error
            ? err.message
            : 'Error al cargar las habilidades. Por favor, recargá la página.'
        );
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
    return validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true });
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
        skill_list: selectedSkills,
      };

      await CandidateService.registerCandidate(requestBody);

      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistroLayout
      role="candidato"
      title="Creá tu cuenta como candidato"
      subtitle="y accedé a ofertas laborales"
    >
      {error && (
        <div className="mb-5">
          <ErrorMessage message={error} />
        </div>
      )}

      <form className="flex flex-col gap-7" onSubmit={handleSubmit}>
        <FormSection title="Datos personales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Field
              label="Nombre"
              required
              error={nameError ? "Nombre obligatorio, máximo 20 caracteres" : undefined}
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu/s nombre/s"
                className={inputClass(nameError)}
                maxLength={20}
                disabled={loading}
              />
            </Field>

            <Field
              label="Apellido"
              required
              error={lastNameError ? "Apellido obligatorio, máximo 20 caracteres" : undefined}
            >
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ingresa tu/s apellido/s"
                className={inputClass(lastNameError)}
                maxLength={20}
                disabled={loading}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Acceso">
          <Field
            label="Correo electrónico"
            required
            error={emailError ? "Email obligatorio, máximo 60 caracteres" : undefined}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              className={inputClass(emailError)}
              maxLength={60}
              disabled={loading}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Field
              label="Contraseña"
              required
              error={
                passwordFormatError
                  ? "La contraseña debe tener máximo 30 caracteres"
                  : undefined
              }
            >
              <PasswordInput
                value={password}
                onChange={handlePasswordChange}
                placeholder="Creá una contraseña segura"
                disabled={loading}
                hasError={passwordFormatError}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
            </Field>

            <Field
              label="Repetir contraseña"
              required
              error={passwordMismatchError ? "Las contraseñas no coinciden" : undefined}
            >
              <PasswordInput
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirmá tu contraseña"
                disabled={loading}
                hasError={passwordMismatchError}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </Field>
          </div>
          <p className="text-[#757575] text-xs -mt-2">
            Máximo 30 caracteres. No admite símbolos especiales ni la letra ñ.
          </p>
        </FormSection>

        <FormSection title="Perfil">
          <Field
            label="Currículum (URL)"
            required
            error={
              cvError
                ? "Ingresá un link válido (http o https), máximo 100 caracteres"
                : undefined
            }
          >
            <Input
              value={cvLink}
              onChange={handleCvLinkChange}
              placeholder="Link a tu CV en PDF o Drive"
              className={inputClass(cvError)}
              maxLength={100}
              disabled={loading}
            />
          </Field>

          <Field
            label="Habilidades"
            required
            error={skillsError ? "Debés seleccionar al menos 1 habilidad" : undefined}
          >
            {skillsLoadError ? (
              <div className="mt-1">
                <ErrorMessage message={skillsLoadError} />
              </div>
            ) : (
              <Select onValueChange={handleSkillSelect} disabled={loadingSkills || loading} value="">
                <SelectTrigger
                  className={`h-auto min-h-[42px] bg-white rounded-lg border px-4 py-2 font-normal text-base text-[#b3b3b3] ${
                    skillsError ? "border-[#cc2222]" : "border-[#d9d9d9]"
                  }`}
                >
                  <SelectValue placeholder={loadingSkills ? "Cargando habilidades..." : "Seleccioná habilidades"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingSkills ? (
                    <div className="px-2 py-1.5 text-sm text-[#757575] ">
                      Cargando...
                    </div>
                  ) : availableSkills.length > 0 ? (
                    availableSkills.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="">
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-[#757575] ">
                      {skillOptions.length === 0 ? 'No hay habilidades disponibles' : 'Todas las habilidades seleccionadas'}
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSkills.map((skillValue) => {
                  const skill = skillOptions.find((s) => s.value === skillValue);
                  return (
                    <div
                      key={skillValue}
                      className="bg-[#3351A6] text-white px-3 py-1.5 rounded-md flex items-center gap-2 font-normal text-sm"
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
          </Field>
        </FormSection>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-[#f46036] hover:bg-[#d9512e] rounded-lg font-medium text-white text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>
    </RegistroLayout>
  );
};