import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Pour ajouter une langue: ajoute l'entrée ici, crée messages/<code>.json,
  // et redémarre. Aucune migration DB nécessaire.
  locales: ["en", "fr"],
  defaultLocale: "en",
  // Préfixe obligatoire partout: /en/... /fr/...
  localePrefix: "always",
});
