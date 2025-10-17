export default function RenderPicture({
  picture,
  sizes,
  alt,
  className,
  imgClassName,
  eager = false,
}) {
  // --- Safe picture renderer ---
  function normalizeSources(picture) {
    if (!picture || typeof picture === "string") return [];
    const s = picture.sources;
    if (Array.isArray(s)) return s;
    if (s && typeof s === "object") return Object.values(s);
    return [];
  }

  if (!picture || typeof picture === "string" || !picture.img) {
    // fallback to plain <img>
    return (
      <img
        src={typeof picture === "string" ? picture : ""}
        alt={alt}
        className={imgClassName}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    );
  }

  const sources = normalizeSources(picture);

  return (
    <picture className={className}>
      {sources.map((s) => (
        <source
          key={s.type || s.srcset}
          type={s.type}
          srcSet={s.srcset}
          sizes={sizes}
        />
      ))}
      <img
        src={picture.img.src}
        width={picture.img.width}
        height={picture.img.height}
        alt={alt}
        className={imgClassName}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
