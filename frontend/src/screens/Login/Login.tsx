import React, { useState, type JSX } from "react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { PageHeader } from "../../components/ui/page-header";
import { FormField } from "../../components/ui/form-fields";
import { LinkButton } from "../../components/ui/link-button";
import { AuthService } from "../../services/auth-service";
import { useNavigate } from "react-router-dom";

/* CONEXIÓN API 
export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.login(email, password);

      if (response.user) {
        AuthService.saveUser(response.user);
        console.log("Login exitoso:", response.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };*/

// FORZANDO EL INICIO DE SESIÓN:
export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const usuarioSimulado = {
        id: 1,
        name: "Nombre",
        last_name: "Apellido",
        email,
        user_type: email.toLowerCase().includes("empresa") ? "empresa" : "candidato",
        company_id: email.toLowerCase().includes("empresa") ? 123 : undefined,
        resume_url: email.toLowerCase().includes("empresa") ? undefined : "https://ejemplo.com/cv.pdf",
        skill_list: email.toLowerCase().includes("empresa") ? undefined : ["JavaScript", "React"],
      };

      AuthService.saveUser(usuarioSimulado);

      if (usuarioSimulado.user_type === "candidato") {
        navigate("/home-candidato");
      } else {
        navigate("/home-empresa");
      }

      console.log("Login simulado exitoso:", usuarioSimulado);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f2f2f2] flex min-h-screen w-full flex-col md:flex-row">
      <aside className="flex w-full md:w-1/2 flex-col items-center justify-center gap-2.5 bg-[#05073c] p-6 md:p-10 min-h-[50vh] md:min-h-screen">
        <div className="inline-flex items-center justify-center">
          <h1 className="text-center [font-family:'Nunito',Helvetica] tracking-[0]">
            <span className="block font-bold text-neutral-50 text-4xl md:text-5xl lg:text-6xl leading-tight md:leading-[72.0px]">
              Portal de Empleos
            </span>
            <span className="block font-semibold text-neutral-50 text-3xl md:text-[48px] lg:text-[54px] leading-tight md:leading-[64.8px] mt-1">
              Instituto Madero
            </span>
          </h1>
        </div>
      </aside>

      <main className="flex w-full md:w-1/2 flex-col items-center justify-center gap-3 md:gap-4 py-8 md:py-10 px-4">
        <form onSubmit={handleLogin} className="flex w-full flex-col items-center gap-3 md:gap-4">
          <PageHeader
            title="Iniciar sesión"
            subtitle="Conectá con oportunidades y talento."
          />

          <div className="h-2 md:h-4" />

          {error && (
            <div className="w-full max-w-[500px] px-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          <FormField
            label="Correo electrónico"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormField
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex w-full max-w-[500px] items-center justify-end px-4 py-1">
            <LinkButton>
              ¿Olvidaste tu contraseña?
            </LinkButton>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 md:h-[56px] w-full max-w-[500px] mx-4 items-center justify-center rounded-lg bg-[#f46036] px-6 py-3 hover:bg-[#f46036]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="[font-family:'Inter',Helvetica] text-base md:text-lg leading-normal tracking-[0] font-medium text-white">
              {loading ? "Ingresando..." : "Ingresar"}
            </span>
          </Button>
        </form>

        <div className="h-4 md:h-6" />

        <div className="flex w-full max-w-[500px] flex-col items-start px-4 py-2">
          <Separator className="h-px w-full" />
        </div>

        <div className="h-4 md:h-6" />

        <div className="inline-flex items-center justify-center px-4 py-2">
          <p className="w-full max-w-[500px] text-center [font-family:'Nunito',Helvetica] text-sm md:text-base leading-relaxed tracking-[0] font-normal">
            <span className="text-[#333333]">
              ¿Todavía no estás registrado?{" "}
            </span>
            <button onClick={() => navigate("/seleccion-de-perfil")} className="text-[#0088ff] hover:underline">
              Creá tu cuenta como Candidato o Empresa.
            </button>

          </p>
        </div>
      </main>
    </div>
  );
};
