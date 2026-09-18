export function GalleryCard({
  image,
  title,
  caption,
}: {
  image: string;
  title: string;
  caption: string;
}) {
  return (
    <article className="gallery-card">
      <div className="gallery-card__media">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="gallery-card__meta">
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
        <span className="circle-arrow" aria-hidden="true">↗</span>
      </div>
    </article>
  );
}
