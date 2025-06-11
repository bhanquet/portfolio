export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD") // split accents from letters
    .replace(/[\u0300-\u036f]/g, "") // remove all accents
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove all non-word characters except hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end
}
