import React from 'react';
import {
  CheckCircle2 as CheckCircleIcon,
  Clock as ClockIcon,
  XCircle as XCircleIcon,
  SendHorizonal as SendIcon,
} from 'lucide-react';

export const getStatusInfo = (status: number | null) => {
  switch (status) {
    case 0:
      return {
        icon: XCircleIcon,
        title: 'No seleccionada',
        text: 'Gracias por tu interés en esta oferta.',
        iconBg: 'bg-[#FFF4E8]',
        iconColor: 'text-[#B45309]',
        badgeBg: 'bg-[#FFF4E8]',
        badgeText: 'text-[#B45309]',
      };

    case 1:
      return {
        icon: CheckCircleIcon,
        title: 'Postulación aceptada',
        text: 'La empresa se pondrá en contacto para continuar el proceso.',
        iconBg: 'bg-[#EAF5F0]',
        iconColor: 'text-[#17835A]',
        badgeBg: 'bg-[#EAF5F0]',
        badgeText: 'text-[#17835A]',
      };

    case 2:
      return {
        icon: ClockIcon,
        title: 'En revisión',
        text: 'Te avisaremos cuando haya novedades.',
        iconBg: 'bg-[#ECEEF6]',
        iconColor: 'text-[#3B4A86]',
        badgeBg: 'bg-[#ECEEF6]',
        badgeText: 'text-[#3B4A86]',
      };

    case 3:
  return {
    icon: SendIcon,
    title: 'Postulación recibida',
    text: 'Te avisaremos cuando haya novedades.',
    iconBg: 'bg-[#F0EBFA]',
    iconColor: 'text-[#7C5CBF]',
    badgeBg: 'bg-[#F0EBFA]',
    badgeText: 'text-[#7C5CBF]',
  };

    default:
      return {
        icon: SendIcon,
        title: 'Postulación registrada',
        text: '',
        iconBg: 'bg-[#f5f5f5]',
        iconColor: 'text-[#757575]',
        badgeBg: 'bg-[#f5f5f5]',
        badgeText: 'text-[#757575]',
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
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg}`}
      >
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

interface StatusBadgeProps {
  status: number | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = getStatusInfo(status);

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.badgeBg} ${config.badgeText}`}
    >
      {config.title}
    </span>
  );
};