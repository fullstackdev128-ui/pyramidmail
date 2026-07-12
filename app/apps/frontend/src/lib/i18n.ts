import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "@/locales/fr";
import en from "@/locales/en";

const storedLanguage = typeof window !== "undefined" ? localStorage.getItem("pyramid_lang") : null;
const language = storedLanguage || "fr";

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: language,
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
