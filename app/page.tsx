import { ButtonLink } from "@/components/ButtonLink";
import { GalleryCard } from "@/components/GalleryCard";
import { Logo } from "@/components/Logo";
import { SectionHeader } from "@/components/SectionHeader";

const highlights = [
  ["01", "Plaza comercial", "+ consultorios"],
  ["02", "Arquitectura", "contemporánea"],
  ["03", "Contexto", "fronterizo"],
  ["04", "Identidad", "premium"],
];

const advantages = [
  ["Ubicación", "Contexto fronterizo estratégico", "Un desarrollo pensado para integrarse a uno de los corredores urbanos de Ciudad Juárez."],
  ["Arquitectura", "Imagen reconocible", "Una materialidad contemporánea que crea presencia, consistencia y valor visual."],
  ["Mix", "Mezcla comercial flexible", "Espacios que pueden recibir distintos giros comerciales y consultorios dentro de una identidad común."],
  ["Acceso", "Experiencia cómoda", "Circulaciones, estacionamiento y accesos diseñados para facilitar la visita y la operación diaria."],
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="inicio">
        <img className="hero__image" src="/images/hero.webp" alt="Distrito Villarreal visto desde la avenida principal" />
        <div className="hero__veil" />
        <header className="nav shell">
          <Logo />
          <nav className="nav__links" aria-label="Navegación principal">
            <a href="#proyecto">Proyecto</a>
            <a href="#masterplan">Masterplan</a>
            <a href="#galeria">Galería</a>
            <a href="#ubicacion">Ubicación</a>
          </nav>
          <ButtonLink href="#contacto">Solicitar información</ButtonLink>
        </header>

        <div className="hero__content shell">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--light">Ciudad Juárez · Chihuahua · México</p>
            <h1>La nueva plaza comercial del corredor Villarreal.</h1>
            <p>
              Comercio, consultorios y una arquitectura contemporánea inspirada en el sur de Estados Unidos,
              adaptada al contexto fronterizo de Ciudad Juárez.
            </p>
            <div className="hero__actions">
              <ButtonLink href="#contacto">Solicitar información</ButtonLink>
              <ButtonLink href="#masterplan" variant="ghost">Ver masterplan</ButtonLink>
            </div>
          </div>
        </div>

        <div className="hero__highlights shell">
          {highlights.map(([number, title, subtitle]) => (
            <div className="highlight" key={number}>
              <span>{number}</span>
              <p><strong>{title}</strong><br />{subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="project section shell" id="proyecto">
        <div className="project__copy">
          <SectionHeader
            eyebrow="El proyecto"
            title="Un desarrollo comercial con identidad propia."
            copy="Distrito Villarreal está diseñado para crear un espacio comercial funcional, atractivo y reconocible, capaz de integrar diferentes giros bajo una misma identidad arquitectónica."
          />
          <p className="project__body">
            La propuesta retoma elementos de la arquitectura comercial del sur de Estados Unidos y los adapta al contexto fronterizo de Ciudad Juárez y El Paso, con una selección de materiales, texturas y tonos que transmiten una imagen contemporánea, cercana y duradera.
          </p>
          <ButtonLink href="#galeria" variant="outline">Conocer el proyecto</ButtonLink>
        </div>
        <div className="project__visual">
          <img src="/images/project.webp" alt="Acceso principal y torre de consultorios de Distrito Villarreal" loading="lazy" />
          <p>Arquitectura que genera valor en el tiempo.</p>
        </div>
        <div className="materials" aria-label="Paleta de materiales">
          <div><span className="swatch swatch--mesh" /><p>Malla perforada<br /><strong>Negro</strong></p></div>
          <div><span className="swatch swatch--sand" /><p>Cantera Sand<br /><strong>Firenze</strong></p></div>
          <div><span className="swatch swatch--terra" /><p>Stucco texturizado<br /><strong>Terracota oxidado</strong></p></div>
          <div><span className="swatch swatch--beige" /><p>Stucco texturizado<br /><strong>Beige</strong></p></div>
          <div><span className="swatch swatch--black" /><p>Panel aluminio<br /><strong>Negro</strong></p></div>
        </div>
      </section>

      <section className="masterplan" id="masterplan">
        <div className="shell masterplan__grid">
          <div className="masterplan__copy">
            <SectionHeader
              eyebrow="Masterplan"
              title="El proyecto, visto completo."
              copy="Una distribución que integra locales comerciales, consultorios, circulación interna y amplias áreas de estacionamiento."
              light
            />
            <ButtonLink href="/images/masterplan.webp" variant="ghost">Ver plano completo</ButtonLink>
          </div>
          <div className="masterplan__media">
            <img src="/images/masterplan.webp" alt="Planta arquitectónica de Distrito Villarreal" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="gallery section shell" id="galeria">
        <div className="gallery__lead">
          <SectionHeader
            eyebrow="Galería"
            title="Espacios que inspiran negocios."
            copy="Una arquitectura contemporánea, funcional y atemporal, pensada para generar una experiencia consistente desde la avenida hasta cada local."
          />
        </div>
        <div className="gallery__grid">
          <GalleryCard image="/images/gallery-front.webp" title="Frente comercial" caption="Marcas que generan vida" />
          <GalleryCard image="/images/gallery-entry.webp" title="Acceso principal" caption="Una entrada con presencia" />
          <GalleryCard image="/images/gallery-retail.webp" title="Locales comerciales" caption="Espacios flexibles" />
        </div>
      </section>

      <section className="advantages section" id="ubicacion">
        <div className="shell advantages__layout">
          <SectionHeader eyebrow="Ventajas" title="Una inversión en el lugar correcto." />
          <div className="advantages__grid">
            {advantages.map(([eyebrow, title, copy]) => (
              <article className="advantage" key={title}>
                <p className="advantage__eyebrow">{eyebrow}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact" id="contacto">
        <div className="contact__texture" aria-hidden="true" />
        <div className="shell contact__grid">
          <div>
            <p className="eyebrow eyebrow--light">Tu próximo negocio te espera</p>
            <h2>Agenda una presentación del proyecto.</h2>
            <p>Conoce disponibilidad, planos comerciales y las oportunidades de Distrito Villarreal.</p>
          </div>
          <form className="lead-form">
            <label>Nombre<input name="nombre" type="text" placeholder="Tu nombre" /></label>
            <label>Teléfono<input name="telefono" type="tel" placeholder="(656) 000 0000" /></label>
            <label>Correo<input name="correo" type="email" placeholder="nombre@empresa.com" /></label>
            <button type="button">Quiero más información <span aria-hidden="true">↗</span></button>
          </form>
          <div className="contact__brand">
            <Logo compact />
            <p>Comercio · Salud · Comunidad<br />Ciudad Juárez, Chihuahua</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer__inner">
          <p>Distrito Villarreal · Ciudad Juárez, Chihuahua, México</p>
          <div>
            <a href="#proyecto">Proyecto</a>
            <a href="#masterplan">Masterplan</a>
            <a href="#galeria">Galería</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
