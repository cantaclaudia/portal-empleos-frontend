import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { PageHeader } from '../components/ui/page-header';
import { FormField } from '../components/ui/form-fields';
import { ErrorMessage } from '../components/ui/error-message';
import AuthService from '../services/auth.service';
import { AuthAside } from '../components/ui/auth-aside';
import { LOGIN_ERRORS } from '../constants/error-codes';
import { ROUTES } from '../routes';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRemember = localStorage.getItem('rememberMe');

    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (value: string): boolean => {
    setEmailError('');

    if (!value) {
      setEmailError(LOGIN_ERRORS.EMAIL_REQUIRED);
      return false;
    }

    if (value.length > 50) {
      setEmailError(LOGIN_ERRORS.EMAIL_TOO_LONG);
      return false;
    }

    if (!value.includes('@')) {
      setEmailError(LOGIN_ERRORS.EMAIL_INVALID);
      return false;
    }

    return true;
  };

  const validatePassword = (value: string): boolean => {
    setPasswordError('');

    if (!value) {
      setPasswordError(LOGIN_ERRORS.PASSWORD_REQUIRED);
      return false;
    }

    if (value.length > 30) {
      setPasswordError(LOGIN_ERRORS.PASSWORD_TOO_LONG);
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
    if (loading) return;
    setLoginError(null);

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
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }

      if (userData.role === 'candidate') {
        navigate(ROUTES.HOME_CANDIDATO, { replace: true });
      } else if (userData.role === 'employer') {
        navigate(ROUTES.HOME_RECLUTADOR, { replace: true });
      } else if (userData.role === 'admin') {
        navigate(ROUTES.HOME_ADMIN, { replace: true });
      } else {
        setLoginError('Tipo de usuario no válido');
      }
    } catch {
      setLoginError('No se pudo iniciar sesión. Verificá tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="bg-[#f2f2f2] flex min-h-screen w-full flex-col md:flex-row">
    <AuthAside />

    <main className="flex w-full md:w-1/2 flex-col items-center justify-center py-8 md:py-10 px-4">
      {/* CAMBIO: tarjeta contenedora. Sin padding horizontal porque los hijos ya traen px-4 */}
      <div className="flex w-full max-w-[560px] flex-col items-center gap-4 bg-white rounded-[14px] border border-gray-100 shadow-sm py-8 md:py-10">
        <form onSubmit={handleLogin} className="flex w-full flex-col items-center gap-4">
          <PageHeader
            title="Iniciar sesión"
            subtitle="Conectá con oportunidades y talento."
          />

          {loginError && <ErrorMessage message={loginError} />}

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
                className="w-4 h-4 rounded border-[#d9d9d9] accent-[#f46036] focus:ring-[#f46036]" // CAMBIO
              />
              <span className="text-sm text-[#333333]">
                Recordar mi usuario
              </span>
            </label>
          </div>

          {/* CAMBIO: wrapper con px-4 en lugar de mx-4 en el botón */}
          <div className="w-full max-w-[500px] px-4">
            <Button
              type="submit"
              disabled={loading || !!emailError || !!passwordError}
              className="h-12 md:h-[56px] w-full items-center justify-center rounded-lg bg-[#f46036] px-6 py-3 hover:bg-[#d9512e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-base md:text-lg leading-normal tracking-[0] font-medium text-white">
                {loading ? 'Ingresando...' : 'Ingresar'}
              </span>
            </Button>
          </div>
        </form>

        {/* CAMBIO: sin spacers, separador con margen propio */}
        <div className="w-full max-w-[500px] px-4 mt-2">
          <Separator className="h-px w-full" />
        </div>

        <p className="w-full max-w-[500px] px-4 text-center text-sm md:text-base leading-relaxed tracking-[0] font-normal">
          <span className="text-[#333333]">
            ¿Todavía no estás registrado?{' '}
          </span>
          <button
            type="button"
            onClick={() => navigate('/registro-candidato')}
            className="text-[#3351A6] font-medium hover:underline" // CAMBIO
          >
            Creá tu cuenta como Candidato o Empresa.
          </button>
        </p>
      </div>
    </main>
  </div>
);
};