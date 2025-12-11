import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/role-selector-card';
import { HeaderLogo } from '../components/ui/header-logo';

interface RoleCard {
  question: string;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
  buttonClassName: string;
  navigateTo: string;
}

const roleCards: RoleCard[] = [
  {
    question:
      "¿Estás buscando trabajo o querés postularte a nuevas oportunidades?",
    buttonText: "Candidato",
    buttonVariant: "default",
    buttonClassName:
      "bg-[#f46036] hover:bg-[#f46036]/90 text-white w-full h-auto px-5 py-2 text-[18px] [font-family:'Nunito',Helvetica] font-medium",
    navigateTo: "/registro-candidato",
  },
  {
    question: "¿Querés publicar búsquedas y encontrar talento para tu equipo?",
    buttonText: "Empresa",
    buttonVariant: "outline",
    buttonClassName:
      "border-[#f46036] text-[#f46036] hover:bg-[#f46036]/10 w-full h-auto px-5 py-2 text-[18px] [font-family:'Nunito',Helvetica] font-medium border-2",
    navigateTo: "/registro-reclutador",
  },
];

export const SeleccionPerfil: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f2f2f2] w-full min-h-screen flex flex-col">
      <header className="w-full bg-[#05073c] px-6 md:px-[50px] py-4">
        <div className="flex items-center justify-start">
          <HeaderLogo />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-[28px] md:text-[32px] leading-[32px] md:leading-[35.8px] mb-2">
            Seleccioná tu rol
          </h1>
          <p className="[font-family:'Nunito',Helvetica] text-[#333333] text-[18px] md:text-[22px] leading-[20.8px]">
            Elegí el perfil que mejor te representa.
          </p>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-6 md:gap-8 mb-12 md:mb-16 max-w-5xl w-full">
          {roleCards.map((card, index) => (
            <Card
              key={index}
              className="bg-white rounded-lg border border-[#dbdbdb] overflow-hidden w-full max-w-md"
            >
              <CardContent className="px-[30px] py-[50px] flex flex-col items-center gap-6">
                <p className="[font-family:'Nunito',Helvetica] text-[#333333] text-[18px] md:text-[20px] text-center leading-[23px] md:leading-[25px]">
                  {card.question}
                </p>
                <Button
                  variant={card.buttonVariant}
                  className={card.buttonClassName}
                  onClick={() => navigate(card.navigateTo)}
                >
                  {card.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="[font-family:'Nunito',Helvetica] text-[18px] md:text-[20px] leading-[28px] md:leading-[30.8px]">
            <span className="text-[#2f2d38]">¿Ya tenés cuenta? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-[#0088ff] hover:underline bg-transparent border-0 cursor-pointer [font-family:'Nunito',Helvetica]"
            >
              Iniciá sesión
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};
