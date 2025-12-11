import { EyeOffIcon } from "lucide-react";
import React, { useState, type JSX } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import JSEncrypt from "jsencrypt";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export const RegistroCandidato = (): JSX.Element => {
  // Estados del formulario
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cvLink, setCvLink] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Estados de visualización
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de error
  const [nameError, setNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordFormatError, setPasswordFormatError] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const [cvError, setCvError] = useState(false);
  const [skillsError, setSkillsError] = useState(false);

  const skillOptions = [
    { value: "1", label: "Adaptabilidad" },
    { value: "2", label: "Responsabilidad" },
    { value: "3", label: "Trabajo en equipo" },
  ];

  const availableSkills = skillOptions.filter(
    (option) => !selectedSkills.includes(option.value)
  );

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

  // Función para encriptar la contraseña
  const encryptPassword = (password: string) => {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey("<PUBLIC_KEY_DEL_BACKEND>"); // reemplazar con la key real
    return jsEncrypt.encrypt(password) || "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasError = false;

    if (name.trim() === "" || name.length > 20) { setNameError(true); hasError = true; } else setNameError(false);
    if (lastName.trim() === "" || lastName.length > 20) { setLastNameError(true); hasError = true; } else setLastNameError(false);
    if (email.trim() === "" || email.length > 60) { setEmailError(true); hasError = true; } else setEmailError(false);
    if (password.trim() === "" || password.length > 30) { setPasswordFormatError(true); hasError = true; } else setPasswordFormatError(false);
    if (password !== confirmPassword) { setPasswordMismatchError(true); hasError = true; } else setPasswordMismatchError(false);
    if (cvLink.trim() === "" || !isValidUrl(cvLink) || cvLink.length > 100) { setCvError(true); hasError = true; } else setCvError(false);
    if (selectedSkills.length < 1) { setSkillsError(true); hasError = true; } else setSkillsError(false);

    if (hasError) return;

    // Encriptar la contraseña antes de enviarla
    const encryptedPassword = encryptPassword(password);

    const requestBody = {
      name: name.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password: encryptedPassword,
      resume_url: cvLink.trim(),
      skill_list: selectedSkills.map((s) => parseInt(s)),
    };

    try {
      const response = await fetch("/registerCandidateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": "<TOKEN_AQUI>",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.code === "0200") {
        alert("Usuario registrado correctamente");
      } else {
        alert(`Error: ${data.description}`);
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
    }
  };

  return (
    <div className="bg-[#f2f2f2] w-full min-h-screen flex flex-col">
      <header className="w-full bg-[#05073c] px-[50px] py-4">
        <div className="flex items-center justify-start">
          <div className="[font-family:'Nunito',Helvetica]">
            <span className="font-semibold text-neutral-50 block text-[22px] leading-[26.4px]">
              Portal de Empleos
            </span>
            <span className="font-medium text-neutral-50 text-[16px] leading-[19.2px]">
              Instituto Madero
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-12">
        <h2 className="[font-family:'Nunito',Helvetica] text-[#05073c] text-[32px] leading-tight mb-12 text-center">
          <span className="font-bold">Creá tu cuenta como candidato </span>
          <span className="font-normal">y accedé a ofertas laborales</span>
        </h2>

        <form className="flex flex-col gap-8 max-w-[928px] mx-auto" onSubmit={handleSubmit}>
          {/* Nombre y Apellido */}
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
              />
              {lastNameError && <p className="text-[#cc2222] text-sm mt-1">Apellido obligatorio, máximo 20 caracteres</p>}
            </div>
          </div>

          {/* Email */}
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
            />
            {emailError && <p className="text-[#cc2222] text-sm mt-1">Email obligatorio, máximo 60 caracteres</p>}
          </div>

          {/* Contraseña */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo Contraseña */}
            <div className="flex flex-col gap-[5px]">
              <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
                Contraseña <span className="text-[#cc2222]">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange} // <-- usamos el handler nuevo
                  placeholder="Creá una contraseña segura"
                  className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 pr-10"
                  maxLength={30}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <EyeOffIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Campo Repetir contraseña */}
            <div className="flex flex-col gap-[5px]">
              <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
                Repetir contraseña <span className="text-[#cc2222]">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange} // <-- handler nuevo
                  placeholder="Confirmá tu contraseña"
                  className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2 pr-10"
                  maxLength={30}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <EyeOffIcon className="w-5 h-5 text-gray-500" />
                </button>

                {/* Renderizado de errores */}
                {(passwordFormatError || passwordMismatchError) && (
                  <div className="text-[#cc2222] text-sm mt-1">
                    {passwordFormatError && <p>La contraseña debe tener máximo 30 caracteres</p>}
                    {passwordMismatchError && <p>Las contraseñas no coinciden</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CV */}
          <div className="flex flex-col gap-[5px]">
            <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
              Currículum (URL) <span className="text-[#cc2222]">*</span>
            </Label>
            <Input
              value={cvLink}
              onChange={handleCvLinkChange}
              placeholder="Link a tu CV en PDF o Drive"
              className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-3 py-2"
            />
            {cvError && <p className="text-[#cc2222] text-sm mt-1">Ingresá un link válido (http o https), máximo 100 caracteres</p>}
          </div>

          {/* Habilidades */}
          <div className="flex flex-col gap-[5px]">
            <Label className="[font-family:'Nunito',Helvetica] font-normal text-sm leading-normal">
              Habilidades <span className="text-[#cc2222]">*</span>
            </Label>
            <Select onValueChange={handleSkillSelect}>
              <SelectTrigger className="h-auto min-h-[42px] bg-white rounded-lg border border-[#d9d9d9] px-4 py-2 [font-family:'Nunito',Helvetica] font-normal text-base text-[#b3b3b3]">
                <SelectValue placeholder="Seleccioná habilidades" />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                {availableSkills.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-[#757575]">Todas las habilidades seleccionadas</div>
                )}
              </SelectContent>
            </Select>

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
            {skillsError && <p className="text-[#cc2222] text-sm mt-1">Debés seleccionar al menos 1 habilidad</p>}
          </div>

          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className="h-auto bg-[#f46036] hover:bg-[#f46036]/90 rounded-lg px-12 py-2.5 [font-family:'Inter',Helvetica] font-normal text-white text-base"
            >
              Registrarse
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};