import React from 'react';
import { CheckCircle2 as CheckCircleIcon, Clock as ClockIcon, XCircle as XCircleIcon, SendHorizonal as SendIcon } from 'lucide-react';

export const getStatusInfo = (status: number | null) => {
  switch (status) {
    case 0:
      return {
        icon: XCircleIcon,
        title: 'No seleccionada',
        text: 'Gracias por tu interés en esta oferta.',
        iconBg: 'bg-[#FDECEC]',
        iconColor: 'text-[#B23B3B]',
      };
    case 1:
      return {
        icon: CheckCircleIcon,
        title: 'Postulación aceptada',
        text: 'La empresa se pondrá en contacto para continuar el proceso.',
        iconBg: 'bg-[#EAF3DE]',
        iconColor: 'text-[#3B6D11]',
      };
    case 2:
      return {
        icon: ClockIcon,
        title: 'En revisión',
        text: 'Te avisaremos cuando haya novedades.',
        iconBg: 'bg-[#E8F0FE]',
        iconColor: 'text-[#3358B8]',
      };
    case 3:
      return {
        icon: SendIcon,
        title: 'Postulación recibida',
        text: 'Te avisaremos cuando haya novedades.',
        iconBg: 'bg-[#FDF6E3]',
        iconColor: 'text-[#96751F]',
      };
    default:
      return {
        icon: SendIcon,
        title: 'Postulación registrada',
        text: '',
        iconBg: 'bg-[#f5f5f5]',
        iconColor: 'text-[#757575]',
      };
  }
};

interface StatusBannerProps {
  status: number | null;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ status }) => {
  const config = getStatusInfo(status);
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#eeeeee] bg-white px-4 py-3.5">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
        <StatusIcon className={`w-[18px] h-[18px] ${config.iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[#06083C] text-sm leading-tight">
          {config.title}
        </p>
        {config.text && (
          <p className="font-normal text-[#888888] text-xs leading-tight mt-0.5">
            {config.text}
          </p>
        )}
      </div>
    </div>
  );
};