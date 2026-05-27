import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Settings {
  nomeSite: string;
  tagline: string;
  emailContato: string;
  modoManutencao: boolean;
  aprovacaoManualAnuncios: boolean;
  prazoMaximoAtivo: 30 | 60 | 90;
  permitirPrecoOculto: boolean;
  aprovacaoManualCadastros: boolean;
  loginGoogle: boolean;
  notifNovoAnuncio: boolean;
  notifNovoUsuario: boolean;
  notifNovaDenuncia: boolean;
}

interface SettingsStore extends Settings {
  update: (patch: Partial<Settings>) => void;
  toggle: (key: keyof Pick<Settings,
    "modoManutencao" | "aprovacaoManualAnuncios" | "permitirPrecoOculto" |
    "aprovacaoManualCadastros" | "loginGoogle" | "notifNovoAnuncio" |
    "notifNovoUsuario" | "notifNovaDenuncia"
  >) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      nomeSite: "ClassicosBR",
      tagline: "O maior acervo de clássicos do Brasil",
      emailContato: "contato@classicosbr.com",
      modoManutencao: false,
      aprovacaoManualAnuncios: false,
      prazoMaximoAtivo: 60,
      permitirPrecoOculto: true,
      aprovacaoManualCadastros: false,
      loginGoogle: true,
      notifNovoAnuncio: true,
      notifNovoUsuario: false,
      notifNovaDenuncia: true,
      update: (patch) => set((s) => ({ ...s, ...patch })),
      toggle: (key) => set((s) => ({ [key]: !s[key as keyof Settings] } as any)),
    }),
    { name: "classicosbr-settings" },
  ),
);
