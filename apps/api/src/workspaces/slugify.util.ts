/** Normaliza um nome livre ("Loja da Maria") num slug de URL ("loja-da-maria"). */
export function slugify(value: string): string {
  const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "") // remove acentos (marcas combinantes pos-NFD)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
