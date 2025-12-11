import React, { type JSX } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/role-selector-card";
import { useNavigate } from "react-router-dom";

const roleCards = [
  {
    question:
      "¿Estás buscando trabajo o querés postularte a nuevas oportunidades?",
    buttonText: "Candidato",
    buttonVariant: "default" as const,
    buttonClassName:
      "bg-[#f46036] hover:bg-[#f46036]/90 text-white w-full h-auto px-5 py-2 text-[18px]",
  },
  {
    question: "¿Querés publicar búsquedas y encontrar talento para tu equipo?",
    buttonText: "Empresa",
    buttonVariant: "outline" as const,
    buttonClassName:
      "border-[#f46036] text-[#f46036] hover:bg-[#f46036]/10 w-full h-auto px-5 py-2 text-[18px]",
  },
];

export const SeleccionDePerfil = (): JSX.Element => {
  const navigate = useNavigate();

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

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="[font-family:'Nunito',Helvetica] font-bold text-[#333333] text-[32px] leading-[35.8px] mb-2">
            Seleccioná tu rol
          </h1>
          <p className="[font-family:'Nunito',Helvetica] text-[#333333] text-[22px] leading-[20.8px]">
            Elegí el perfil que mejor te representa.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mb-16 max-w-5xl">
          {roleCards.map((card, index) => (
            <Card
              key={index}
              className="bg-white rounded-lg border border-[#dbdbdb] overflow-hidden w-full max-w-md"
            >
              <CardContent className="px-[30px] py-[50px] flex flex-col items-center gap-6">
                <p className="[font-family:'Nunito',Helvetica] text-[#333333] text-[20px] text-center leading-[25px]">
                  {card.question}
                </p>
                <Button
                  variant={card.buttonVariant}
                  className={card.buttonClassName}
                  onClick={() =>
                    card.buttonText === "Candidato"
                      ? navigate("/registro-candidato")
                      : navigate("/registro-reclutador")
                  }
                >
                  {card.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="[font-family:'Nunito',Helvetica] text-[20px] leading-[30.8px]">
            <span className="text-[#2f2d38]">¿Ya tenés cuenta? </span>
            <button
              onClick={() => navigate("/")} // <-- Navega al login
              className="text-[#0088ff] hover:underline bg-transparent border-0 cursor-pointer"
            >
              Iniciá sesión
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};