import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ErrorMessage } from "../components/ui/error-message";
import EmployerService from "../services/employer.service";
import CompanyService from "../services/company.service";
import {
  RegistroLayout,
  FormSection,
  Field,
  PasswordInput,
  inputClass,
} from "../components/registro-layout";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../components/ui/select";
import { sanitizePassword, encryptPassword } from "../utils/password";

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

        const result = await CompanyService.getCompaniesList();

        if (Array.isArray(result.data)) {
          const formattedCompanies = result.data.map(
            (company) => ({
              value: company.company_id.toString(),
              label: company.name,
            })
          );

          setCompanyOptions(formattedCompanies);
        }
      } catch (err) {
        console.error("Error loading companies:", err);
        setCompaniesLoadError(
          err instanceof Error ? err.message : "Error al cargar las empresas."
        );
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(sanitizePassword(e.target.value));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(sanitizePassword(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    let hasError = false;

    if (name.trim() === "" || name.length > 20) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    if (lastName.trim() === "" || lastName.length > 20) {
      setLastNameError(true);
      hasError = true;
    } else {
      setLastNameError(false);
    }

    if (email.trim() === "" || email.length > 60) {
      setEmailError(true);
      hasError = true;
    } else {
      setEmailError(false);
    }

    if (password.trim() === "" || password.length > 30) {
      setPasswordFormatError(true);
      hasError = true;
    } else {
      setPasswordFormatError(false);
    }

    if (password !== confirmPassword) {
      setPasswordMismatchError(true);
      hasError = true;
    } else {
      setPasswordMismatchError(false);
    }

    if (companyId.trim() === "") {
      setCompanyError(true);
      hasError = true;
    } else {
      setCompanyError(false);
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
        company_id: parseInt(companyId),
      };

      await EmployerService.registerEmployer(requestBody);
      navigate('/login');
    } catch (err) {
      console.error('Error during registration:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistroLayout
      role="reclutador"
      title="Creá tu cuenta como reclutador"
      subtitle="y publicá ofertas laborales"
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
            Máximo 30 caracteres. No admite símbolos especiales.
          </p>
        </FormSection>

        <FormSection title="Empresa">
          <Field
            label="Empresa"
            required
            error={companyError ? "Debés seleccionar una empresa" : undefined}
          >
            {companiesLoadError ? (
              <div className="h-auto min-h-[42px] bg-white rounded-lg border border-[#cc2222] px-4 py-2 flex items-center">
                <p className="font-normal text-sm text-[#cc2222]">
                  {companiesLoadError}
                </p>
              </div>
            ) : (
              <Select
                value={companyId}
                onValueChange={setCompanyId}
                disabled={loadingCompanies || loading}
              >
                <SelectTrigger
                  className={`h-auto min-h-[42px] bg-white rounded-lg border px-4 py-2 font-normal text-base text-[#b3b3b3] ${companyError ? "border-[#cc2222]" : "border-[#d9d9d9]"
                    }`}
                >
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
          </Field>
        </FormSection>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg font-medium text-base"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>
    </RegistroLayout>
  );
};