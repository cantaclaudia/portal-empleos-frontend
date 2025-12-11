import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HomeCandidato } from "../screens/HomeCandidato";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <HomeCandidato />
  </StrictMode>,
);
