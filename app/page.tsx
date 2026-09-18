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

const corridorStats = [
  ["458,878", "Habitantes", "Área de influencia directa del corredor De Las Torres / Francisco Villarreal Torres.", "IMIP"],
  ["80%", "Proximidad", "De la población del área de influencia vive a menos de 500 m del corredor.", "IMIP"],
  ["1.6 M", "Ciudad Juárez", "Población reportada para el mercado de Ciudad Juárez.", "Cushman & Wakefield"],
  ["1.1 M", "15–64 años", "Población en edad laboral en Ciudad Juárez.", "Cushman & Wakefield"],
];

const economicStats = [
  ["269,238", "Personal IMMEX"],
  ["302,638", "Empleo manufacturero"],
  ["$27,619 MXN", "Ingreso mensual mediano por hogar"],
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
            <a href="#mercado">Mercado</a>
            <a href="#ubicacion">Ubicación</a>
            <a href="#masterplan">Masterplan</a>
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
            <span>Juárez / MX</span>
            <span>Corredor / Villarreal</span>
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

      <section className="market" id="mercado">
        <div className="shell market__head">
          <div>
            <p className="chapter">02 / Mercado</p>
            <p className="eyebrow">El corredor</p>
            <h2>El mercado detrás de la arquitectura.</h2>
          </div>
          <p className="market__intro">
            Distrito Villarreal se integra al corredor De Las Torres / Francisco Villarreal Torres,
            uno de los ejes urbanos de mayor importancia de Ciudad Juárez. Los datos de influencia
            corresponden al corredor completo, no a un radio específico alrededor del predio.
          </p>
        </div>

        <div className="shell market__stats" aria-label="Indicadores del corredor y Ciudad Juárez">
          {corridorStats.map(([value, label, copy, source]) => (
            <article className="market-stat" key={value}>
              <span className="market-stat__value">{value}</span>
              <div className="market-stat__meta">
                <p className="market-stat__label">{label}</p>
                <p className="market-stat__copy">{copy}</p>
                <span className="market-stat__source">{source}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="market__economy">
          <div className="shell market__economy-grid">
            <div className="market__economy-copy">
              <span>Contexto económico</span>
              <p>Una ciudad con escala laboral, manufacturera y de consumo.</p>
            </div>
            {economicStats.map(([value, label]) => (
              <div className="economy-stat" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="shell market__sources">
          <span>Fuentes</span>
          <a href="https://www.imip.org.mx/pdus2040/documento/03_CAPITULO_III_ESTRATEGIAS.pdf" target="_blank" rel="noreferrer">
            IMIP · PDU 2040 · Corredor De Las Torres / Francisco Villarreal Torres ↗
          </a>
          <a href="https://sch.cushmanwakefield.com/api/public/content/Mexico-Industrial-Labor-Report_Q42025?v=c2016a72" target="_blank" rel="noreferrer">
            Cushman &amp; Wakefield · Mexico Industrial Labor Report Q4 2025 ↗
          </a>
        </div>
      </section>

      <section className="location" id="ubicacion">
        <div className="shell location__head">
          <div>
            <p className="chapter">03 / Ubicación</p>
            <p className="eyebrow">Conectividad</p>
            <h2>Un corredor que conecta comercio, ciudad y frontera.</h2>
          </div>
          <div className="location__intro">
            <p>
              Distrito Villarreal se inserta sobre el eje Francisco Villarreal Torres / De Las Torres,
              rodeado de actividad comercial y conectado con vialidades que articulan distintos sectores
              de Ciudad Juárez.
            </p>
            <span>Esquema de conectividad · No a escala</span>
          </div>
        </div>

        <div className="shell location__layout">
          <div className="corridor-map" role="img" aria-label="Esquema de conectividad del corredor Francisco Villarreal Torres y referencias comerciales">
            <div className="corridor-map__grid" aria-hidden="true" />
            <div className="road road--main"><span>Francisco Villarreal Torres</span></div>
            <div className="road road--cross road--gomez"><span>Gómez Morín</span></div>
            <div className="road road--cross road--ejercito"><span>Ejército Nacional</span></div>
            <div className="road road--branch road--torres"><span>Av. de las Torres</span></div>
            <div className="road road--branch road--zaragoza"><span>Blvd. Zaragoza</span></div>

            <div className="map-pin map-pin--project">
              <i />
              <strong>Distrito Villarreal</strong>
              <span>Proyecto</span>
            </div>
            <div className="map-pin map-pin--tres">
              <i />
              <strong>Plaza Tres Torres</strong>
              <span>Referencia comercial</span>
            </div>
            <div className="map-pin map-pin--verona">
              <i />
              <strong>Plaza Verona</strong>
              <span>Referencia comercial</span>
            </div>
            <div className="map-pin map-pin--sendero">
              <i />
              <strong>Sendero Las Torres</strong>
              <span>Centro comercial</span>
            </div>
            <div className="map-pin map-pin--patio">
              <i />
              <strong>Patio Zaragoza</strong>
              <span>Centro comercial</span>
            </div>

            <div className="corridor-map__north">
              <span>N</span>
              <i aria-hidden="true">↑</i>
            </div>
          </div>

          <div className="location__nodes">
            <article>
              <span className="location-node__index">01</span>
              <div>
                <p>Sobre el corredor</p>
                <h3>Plaza Tres Torres</h3>
                <span>Blvd. Francisco Villarreal Torres 11204</span>
              </div>
              <a href="https://www.ugmas.mx/plaza-tres-torres" target="_blank" rel="noreferrer" aria-label="Fuente Plaza Tres Torres">↗</a>
            </article>

            <article>
              <span className="location-node__index">02</span>
              <div>
                <p>Francisco Villarreal Torres</p>
                <h3>Plaza Verona</h3>
                <span>Referencia comercial del mismo eje urbano</span>
              </div>
              <a href="https://firmania.mx/ciudad-ju%C3%A1rez-ju%C3%A1rez/plaza-verona-154286" target="_blank" rel="noreferrer" aria-label="Fuente Plaza Verona">↗</a>
            </article>

            <article>
              <span className="location-node__index">03</span>
              <div>
                <p>Av. de las Torres</p>
                <h3>Plaza Sendero Las Torres</h3>
                <span>Av. de las Torres 2111</span>
              </div>
              <a href="https://plazasendero.com.mx/plaza/las-torres/" target="_blank" rel="noreferrer" aria-label="Fuente Plaza Sendero Las Torres">↗</a>
            </article>

            <article>
              <span className="location-node__index">04</span>
              <div>
                <p>Blvd. Zaragoza</p>
                <h3>Patio Zaragoza</h3>
                <span>Blvd. Zaragoza &amp; Blvd. Óscar Flores</span>
              </div>
              <a href="https://www.waze.com/es/live-map/directions/mx/chih./cd.-juarez/patio-zaragoza?to=place.ChIJp2KSjUZe54YRY2fdL5DuVcY" target="_blank" rel="noreferrer" aria-label="Fuente Patio Zaragoza">↗</a>
            </article>
          </div>
        </div>

        <div className="location__border">
          <div className="shell location__border-grid">
            <div>
              <span>Conectividad fronteriza</span>
              <p>Dos cruces internacionales forman parte de la red de conectividad de Ciudad Juárez.</p>
            </div>
            <div className="border-node">
              <span>MX / US</span>
              <strong>Puente Internacional Zaragoza</strong>
              <p>Waterfill · Ciudad Juárez</p>
            </div>
            <div className="border-node">
              <span>MX / US</span>
              <strong>Puente Córdova–Américas</strong>
              <p>Ciudad Juárez · El Paso</p>
            </div>
            <a className="border-source" href="https://www.puentesfronterizos.gob.mx/" target="_blank" rel="noreferrer">
              Fideicomiso de Puentes Fronterizos ↗
            </a>
          </div>
        </div>

        <div className="shell location__note">
          <span>Nota</span>
          <p>
            La sección muestra relaciones urbanas y referencias verificadas; no representa distancias,
            tiempos de traslado ni radios comerciales del predio. Esos datos se incorporarán únicamente
            cuando exista medición específica.
          </p>
        </div>
      </section>

      <section className="masterplan" id="masterplan">
        <div className="masterplan__number" aria-hidden="true">04</div>
        <div className="shell masterplan__grid">
          <div className="masterplan__copy">
            <p className="chapter chapter--light">04 / Masterplan</p>
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
            <p className="chapter">05 / Galería</p>
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
              <p className="chapter">06 / Ventajas</p>
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
            <p className="chapter chapter--light">07 / Contacto</p>
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
            <a href="#mercado">Mercado</a>
            <a href="#ubicacion">Ubicación</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
