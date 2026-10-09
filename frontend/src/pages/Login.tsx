import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { PageHeader } from '../components/ui/page-header';
import { FormField } from '../components/ui/form-fields';
import { ErrorMessage } from '../components/ui/error-message';
import AuthService from '../services/auth.service';
import { AuthAside } from '../components/ui/auth-aside';
import { LOGIN_ERRORS } from '../constants/error-codes';
import { getHomeRoute } from '../utils/roles';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { SuccessMessage } from '../components/ui/success-message';


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = (location.state as { registered?: boolean; email?: string } | null) ?? null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Si viene de registrarse, se precarga el email recién usado
    if (justRegistered?.email) {
      setEmail(justRegistered.email);
      return;
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRemember = localStorage.getItem('rememberMe');

    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError(LOGIN_ERRORS.EMAIL_REQUIRED);
      return false;
    }

    if (value.length > 60) {
      setEmailError(LOGIN_ERRORS.EMAIL_TOO_LONG);
      return false;
    }

    if (!value.includes('@')) {
      setEmailError(LOGIN_ERRORS.EMAIL_INVALID);
      return false;
    }

    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError(LOGIN_ERRORS.PASSWORD_REQUIRED);
      return false;
    }

    if (value.length > 30) {
      setPasswordError(LOGIN_ERRORS.PASSWORD_TOO_LONG);
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 30);

    setPassword(value);

    if (passwordError) setPasswordError('');
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
      const userData = await AuthService.login(email.trim(), password);

      AuthService.saveUser(userData);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }

      if (!['candidate', 'employer', 'admin'].includes(userData.role)) {
        AuthService.logout();
        setLoginError('Tipo de usuario no válido');
        return;
      }

      navigate(getHomeRoute(userData.role), { replace: true });
    } catch {
      setLoginError('No se pudo iniciar sesión. Verificá tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const existingUser = AuthService.getUser();

  if (existingUser) {
    return <Navigate to={getHomeRoute(existingUser.role)} replace />;
  }

  return (
    <div className="bg-[#f2f2f2] flex min-h-screen w-full flex-col md:flex-row">
      <AuthAside />

      <main className="flex w-full md:w-1/2 flex-col items-center justify-center py-8 md:py-10 px-4">
        <div className="flex w-full max-w-[560px] flex-col items-center gap-4 bg-white rounded-[14px] border border-gray-100 shadow-sm py-8 md:py-10">

          <form
            onSubmit={handleLogin}
            className="flex w-full flex-col items-center gap-4"
          >
            <PageHeader
              title="Iniciar sesión"
              subtitle="Conectá con oportunidades y talento."
            />

            {justRegistered?.registered && !loginError && (
              <SuccessMessage message="¡Cuenta creada! Iniciá sesión con tu correo y contraseña." />
            )}

            {loginError && (
              <ErrorMessage message={loginError} />
            )}

            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="Ingresa tu correo electrónico"
              required
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              maxLength={60}
            />

            <FormField
              label="Contraseña"
              name="password"
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
                  className="w-4 h-4 rounded border-[#d9d9d9] accent-brand focus:ring-brand"
                />

                <span className="text-sm text-[#333333]">
                  Recordar mi usuario
                </span>
              </label>
            </div>

            <div className="w-full max-w-[500px] px-4">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 md:h-[52px] w-full items-center justify-center rounded-lg px-6 py-3"
              >
                <span className="text-sm md:text-base leading-normal tracking-[0] font-medium text-white">
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </span>
              </Button>
            </div>
          </form>

          <div className="w-full max-w-[500px] px-4 mt-2">
            <Separator className="h-px w-full" />
          </div>

          <p className="w-full max-w-[500px] px-4 text-center text-sm leading-relaxed tracking-[0] font-normal">
            <span className="text-[#333333]">
              ¿Todavía no estás registrado?
            </span>

            <br />

            <button
              type="button"
              onClick={() => navigate('/registro-candidato')}
              className="text-accent text-sm font-medium hover:underline"
            >
              Creá tu cuenta como Candidato o Empresa.
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};