// Placeholder oscuro (SVG inline) para cuando una imagen de pin no carga.
// Evita el "cuadro blanco" que JAMÁS debe verse.
export const IMG_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'>" +
      "<rect width='100%' height='100%' fill='#18181b'/>" +
      "<g fill='#3f3f46'><circle cx='200' cy='210' r='46'/>" +
      "<path d='M110 360l66-78 44 50 38-34 52 62z'/></g>" +
      "<text x='50%' y='450' fill='#52525b' font-family='sans-serif' " +
      "font-size='20' text-anchor='middle'>Imagen no disponible</text></svg>"
  );

// Handler onError reutilizable: cambia a placeholder y evita bucles.
export function onImgError(e) {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = IMG_PLACEHOLDER;
}
