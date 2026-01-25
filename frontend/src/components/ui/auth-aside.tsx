export const AuthAside: React.FC = () => {
  return (
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
  );
};