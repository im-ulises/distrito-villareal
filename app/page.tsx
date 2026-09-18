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
  ["01", "Ubicación", "Contexto fronterizo estratégico", "Un desarrollo pensado para integrarse al entorno urbano de Ciudad Juárez."],
  ["02", "Arquitectura", "Imagen reconocible", "Una materialidad contemporánea que crea presencia, consistencia y valor visual."],
  ["03", "Mix", "Mezcla comercial flexible", "Espacios capaces de integrar distintos giros comerciales y consultorios bajo una misma identidad."],
  ["04", "Acceso", "Experiencia cómoda", "Circulaciones, estacionamiento y accesos pensados para facilitar la visita y la operación diaria."],
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="inicio">
        <img className="hero__image" src="/images/hero.webp" alt="Distrito Villarreal visto desde la avenida principal" />
        <div className="hero__veil" />
        <div className="hero__grain" aria-hidden="true" />

        <header className="nav shell">
          <Logo />
          <nav className="nav__links" aria-label="Navegación principal">
            <a href="#proyecto">Proyecto</a>
            <a href="#masterplan">Masterplan</a>
            <a href="#galeria">Galería</a>
            <a href="#ubicacion">Ventajas</a>
          </nav>
          <ButtonLink href="#contacto">Solicitar información</ButtonLink>
        </header>

        <div className="hero__content shell">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--light hero__eyebrow">Ciudad Juárez · Chihuahua · México</p>
            <h1>La nueva plaza comercial del corredor Villarreal.</h1>
            <div className="hero__lower">
              <p>
                Comercio, consultorios y arquitectura contemporánea inspirada en el sur de Estados Unidos,
                adaptada al contexto fronterizo de Ciudad Juárez.
              </p>
              <div className="hero__actions">
                <ButtonLink href="#contacto">Solicitar información</ButtonLink>
                <ButtonLink href="#masterplan" variant="ghost">Explorar proyecto</ButtonLink>
              </div>
            </div>
          </div>

          <div className="hero__side-label" aria-hidden="true">
            <span>DV</span>
            <span>25°39&apos;N</span>
            <span>106°28&apos;W</span>
          </div>
        </div>

        <div className="hero__bottom shell">
          <div className="hero__highlights">
            {highlights.map(([number, title, subtitle]) => (
              <div className="highlight" key={number}>
                <span>{number}</span>
                <p><strong>{title}</strong><br />{subtitle}</p>
              </div>
            ))}
          </div>
          <a className="hero__scroll" href="#proyecto">
            <span>Scroll</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="project section shell" id="proyecto">
        <div className="project__intro">
          <p className="chapter">01 / Proyecto</p>
          <SectionHeader
            eyebrow="Distrito Villarreal"
            title="Un desarrollo comercial con identidad propia."
            copy="Distrito Villarreal está diseñado para crear un espacio comercial funcional, atractivo y reconocible, capaz de integrar diferentes giros bajo una misma identidad arquitectónica."
          />
          <p className="project__body">
            La propuesta retoma elementos de la arquitectura comercial del sur de Estados Unidos y los adapta al contexto fronterizo de Ciudad Juárez y El Paso, con una selección de materiales, texturas y tonos que transmiten una imagen contemporánea, cercana y duradera.
          </p>
          <ButtonLink href="#galeria" variant="outline">Conocer el proyecto</ButtonLink>
        </div>

        <figure className="project__visual">
          <div className="project__visual-frame">
            <img src="/images/project.webp" alt="Acceso principal y torre de consultorios de Distrito Villarreal" loading="lazy" />
          </div>
          <figcaption>
            <span>Vista del proyecto</span>
            <span>Arquitectura que genera valor en el tiempo.</span>
          </figcaption>
        </figure>

        <div className="materials" aria-label="Paleta de materiales">
          <div><span className="swatch swatch--mesh" /><p>Malla perforada<br /><strong>Negro</strong></p></div>
          <div><span className="swatch swatch--sand" /><p>Cantera Sand<br /><strong>Firenze</strong></p></div>
          <div><span className="swatch swatch--terra" /><p>Stucco texturizado<br /><strong>Terracota oxidado</strong></p></div>
          <div><span className="swatch swatch--beige" /><p>Stucco texturizado<br /><strong>Beige</strong></p></div>
          <div><span className="swatch swatch--black" /><p>Panel aluminio<br /><strong>Negro</strong></p></div>
        </div>
      </section>

      <section className="masterplan" id="masterplan">
        <div className="masterplan__number" aria-hidden="true">02</div>
        <div className="shell masterplan__grid">
          <div className="masterplan__copy">
            <p className="chapter chapter--light">02 / Masterplan</p>
            <SectionHeader
              eyebrow="Organización del proyecto"
              title="El proyecto, visto completo."
              copy="Una distribución que integra locales comerciales, consultorios, circulación interna y áreas de estacionamiento."
              light
            />
            <div className="masterplan__legend">
              <span><i /> Comercio</span>
              <span><i /> Consultorios</span>
              <span><i /> Circulación</span>
            </div>
            <ButtonLink href="/images/masterplan.webp" variant="ghost">Ver plano completo</ButtonLink>
          </div>
          <figure className="masterplan__media">
            <img src="/images/masterplan.webp" alt="Planta arquitectónica de Distrito Villarreal" loading="lazy" />
            <figcaption>
              <span>Masterplan arquitectónico</span>
              <span>Distrito Villarreal</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="gallery section shell" id="galeria">
        <div className="gallery__lead">
          <div>
            <p className="chapter">03 / Galería</p>
            <SectionHeader
              eyebrow="Arquitectura"
              title="Espacios que inspiran negocios."
              copy="Una arquitectura contemporánea, funcional y atemporal, pensada para generar una experiencia consistente desde la avenida hasta cada local."
            />
          </div>
          <p className="gallery__note">Frentes comerciales · accesos · locales · consultorios</p>
        </div>

        <div className="gallery__grid">
          <div className="gallery__featured">
            <GalleryCard image="/images/gallery-front.webp" title="Frente comercial" caption="Marcas que generan vida" />
          </div>
          <div className="gallery__secondary">
            <GalleryCard image="/images/gallery-entry.webp" title="Acceso principal" caption="Una entrada con presencia" />
          </div>
          <div className="gallery__statement">
            <span>Distrito Villarreal</span>
            <p>Una identidad visual que se reconoce antes de llegar.</p>
          </div>
          <div className="gallery__tertiary">
            <GalleryCard image="/images/gallery-retail.webp" title="Locales comerciales" caption="Espacios flexibles" />
          </div>
        </div>
      </section>

      <section className="advantages section" id="ubicacion">
        <div className="shell">
          <div className="advantages__head">
            <div>
              <p className="chapter">04 / Ventajas</p>
              <SectionHeader eyebrow="Valor del proyecto" title="Diseñado para funcionar. Pensado para destacar." />
            </div>
            <p className="advantages__lead">
              Una propuesta que combina arquitectura, operación y experiencia bajo un lenguaje coherente.
            </p>
          </div>

          <div className="advantages__list">
            {advantages.map(([number, eyebrow, title, copy]) => (
              <article className="advantage" key={title}>
                <span className="advantage__number">{number}</span>
                <p className="advantage__eyebrow">{eyebrow}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="advantage__arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact" id="contacto">
        <div className="contact__texture" aria-hidden="true" />
        <div className="shell contact__grid">
          <div className="contact__intro">
            <p className="chapter chapter--light">05 / Contacto</p>
            <p className="eyebrow eyebrow--light">Tu próximo negocio te espera</p>
            <h2>Agenda una presentación del proyecto.</h2>
            <p>Conoce disponibilidad, planos comerciales y oportunidades dentro de Distrito Villarreal.</p>
          </div>

          <form className="lead-form">
            <label>
              <span>01 / Nombre</span>
              <input name="nombre" type="text" placeholder="Tu nombre" />
            </label>
            <label>
              <span>02 / Teléfono</span>
              <input name="telefono" type="tel" placeholder="(656) 000 0000" />
            </label>
            <label>
              <span>03 / Correo</span>
              <input name="correo" type="email" placeholder="nombre@empresa.com" />
            </label>
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
