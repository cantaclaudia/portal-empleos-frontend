import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { PageHeader } from '../components/ui/page-header';
import { FormField } from '../components/ui/form-fields';
import { LinkButton } from '../components/ui/link-button';
import { ErrorMessage } from '../components/ui/error-message';
import AuthService from '../services/auth.service';
import { AuthAside } from '../components/ui/auth-aside';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const savedRemember = localStorage.getItem('rememberMe');
    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
      if (savedPassword) {
        setPassword(savedPassword);
      }
    }
  }, []);

  const validateEmail = (value: string): boolean => {
    setEmailError('');
    if (value.length > 50) {
      setEmailError('El correo no puede exceder 50 caracteres');
      return false;
    }
    return true;
  };

  const validatePassword = (value: string): boolean => {
    setPasswordError('');
    if (value.length > 30) {
      setPasswordError('La contraseña no puede exceder 30 caracteres');
      return false;
    }
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const userData = await AuthService.login(email, password);

      AuthService.saveUser(userData);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }

      if (userData.role === 'candidate') {
        navigate('/home-candidato', { replace: true });
      } else if (userData.role === 'employer') {
        navigate('/home-empresa', { replace: true });
      } else {
        setError('Tipo de usuario no válido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f2f2f2] flex min-h-screen w-full flex-col md:flex-row">
      <AuthAside />

      <main className="flex w-full md:w-1/2 flex-col items-center justify-center gap-3 md:gap-4 py-8 md:py-10 px-4">
        <form onSubmit={handleLogin} className="flex w-full flex-col items-center gap-3 md:gap-4">
          <PageHeader
            title="Iniciar sesión"
            subtitle="Conectá con oportunidades y talento."
          />

          <div className="h-1 md:h-3" />

          {error && <ErrorMessage message={error} />}

          <FormField
            label="Correo electrónico"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            required
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            maxLength={50}
          />

          <FormField
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            required
            value={password}
            onChange={handlePasswordChange}
            error={passwordError}
            maxLength={30}
            showPasswordToggle
          />

          <div className="flex w-full max-w-[500px] items-center justify-between px-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#d9d9d9] text-[#f46036] focus:ring-[#f46036]"
              />
              <span className="[font-family:'Nunito',Helvetica] text-sm text-[#333333]">
                Recordar mi usuario
              </span>
            </label>

            <LinkButton>
              ¿Olvidaste tu contraseña?
            </LinkButton>
          </div>

          <Button
            type="submit"
            disabled={loading || !!emailError || !!passwordError}
            className="h-12 md:h-[56px] w-full max-w-[500px] mx-4 items-center justify-center rounded-lg bg-[#f46036] px-6 py-3 hover:bg-[#f46036]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="[font-family:'Nunito',Helvetica] text-base md:text-lg leading-normal tracking-[0] font-medium text-white">
              {loading ? 'Ingresando...' : 'Ingresar'}
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
              ¿Todavía no estás registrado?{' '}
            </span>
            <button
              type="button"
              onClick={() => navigate('/seleccion-de-perfil')}
              className="text-[#0088ff] hover:underline"
            >
              Creá tu cuenta como Candidato o Empresa.
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};
