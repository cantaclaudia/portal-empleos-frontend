import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeaderLogo } from "./ui/header-logo";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Footer } from "./ui/footer";

type Role = "candidato" | "reclutador";

const ROLES: { key: Role; label: string; path: string }[] = [
    { key: "candidato", label: "Candidato", path: "/registro-candidato" },
    { key: "reclutador", label: "Reclutador", path: "/registro-reclutador" },
];

interface RegistroLayoutProps {
    role: Role;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export const RegistroLayout = ({
    role,
    title,
    subtitle,
    children,
}: RegistroLayoutProps): React.ReactElement => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#f2f2f2] w-full min-h-screen flex flex-col">
            <header className="w-full bg-[#05073c] px-6 md:px-[50px] py-4">
                <div className="flex items-center justify-start">
                    <HeaderLogo />
                </div>
            </header>

            <section className="bg-gradient-to-r from-[#1e2749] to-[#2a3558] text-white px-4 pt-8 pb-10 md:pb-12 text-center">
                <h1 className="font-bold text-2xl md:text-[28px] leading-tight">{title}</h1>
                <p className="text-white/70 text-sm md:text-base mt-1">{subtitle}</p>

                <nav
                    className="inline-flex mt-6 p-1 rounded-lg bg-white/10"
                    aria-label="Tipo de cuenta"
                >
                    {ROLES.map((r) => {
                        const active = r.key === role;
                        return (
                            <button
                                key={r.key}
                                type="button"
                                aria-current={active ? "page" : undefined}
                                onClick={active ? undefined : () => navigate(r.path)}
                                className={`px-5 py-1.5 rounded-md text-sm transition-colors ${active
                                    ? "bg-[#f46036] text-white font-bold cursor-default"
                                    : "text-white/85 hover:bg-white/10 cursor-pointer"
                                    }`}
                            >
                                {r.label}
                            </button>
                        );
                    })}
                </nav>
            </section>

            <main className="flex-1 w-full px-4 pb-12">
                <div className="max-w-[600px] mx-auto mt-6 md:mt-8 bg-white rounded-[14px] border border-gray-100 shadow-sm p-5 md:p-8">
                    {children}

                    <p className="mt-6 text-center text-[#2f2d38] text-sm md:text-base">
                        ¿Ya tenés cuenta?
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="ml-2 text-[#3351A6] hover:underline bg-transparent border-0 cursor-pointer font-medium"
                        >
                            Iniciá sesión
                        </button>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export const FormSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}): React.ReactElement => (
    <section className="flex flex-col gap-4">
        <h2 className="font-bold text-[#05073c] text-sm pb-2 border-b border-gray-100">
            {title}
        </h2>
        {children}
    </section>
);

interface FieldProps {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}

export const Field = ({
    label,
    required,
    error,
    hint,
    children,
}: FieldProps): React.ReactElement => (
    <div className="flex flex-col gap-[5px]">
        <Label className="font-normal text-sm leading-normal">
            {label} {required && <span className="text-[#cc2222]">*</span>}
        </Label>
        {children}
        {hint && !error && <p className="text-[#757575] text-xs">{hint}</p>}
        {error && <p className="text-[#cc2222] text-sm">{error}</p>}
    </div>
);

// Clases de input: el borde se pone rojo cuando el campo tiene error
export const inputClass = (hasError?: boolean): string =>
    `h-auto min-h-[42px] bg-white rounded-lg border px-3 py-2 ${hasError ? "border-[#cc2222]" : "border-[#d9d9d9]"
    }`;

interface PasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    disabled?: boolean;
    hasError?: boolean;
    show: boolean;
    onToggle: () => void;
}

export const PasswordInput = ({
    value,
    onChange,
    placeholder,
    disabled,
    hasError,
    show,
    onToggle,
}: PasswordInputProps): React.ReactElement => (
    <div className="relative">
        <Input
            type={show ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${inputClass(hasError)} pr-10`}
            maxLength={30}
            disabled={disabled}
        />
        <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#333333] transition-colors"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
    </div>
);