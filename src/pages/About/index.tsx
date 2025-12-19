// pages/About/index.tsx
import logo from '@/assets/images/home_page/amigos-unite-logo-128.png';
import styles from './About.module.scss';

export default function AboutPage() {
  return (
    <div className="page-container page-container--single">
      <div className="container container--center page-container__inner">
 {/* Section with the 800px cap (inherits from page__inner) */}
        <section className="section">
          <div className="container container--center container--800">
            <img
              src={logo}
              alt="Amigos Unite logo"
              style={{ display: 'block', marginInline: 'auto', maxWidth: 320 }}
            />
          </div>
        </section>
        <section className="section">
          <h1 className="page-title">About Amigos Unite</h1>
        </section>

        {/* Narrow 640px sections inside */}
        <section className="section--narrow">
          <h2 className="section__title">What We’re About</h2>
          <div className="prose">
            <p>
              Amigos Unite is about bringing people together in common cause within our respective communities to address issues related to quality of life.
            </p>
            <p>
              It’s a place where people living in communities across the nation get to know one another and come to an understanding of what everyone within the community hopes the
              community will become.
            </p>
            <p>
              It’s also a place where everyone can come together to discuss politics at the national or state level that affects them.
            </p>
            <p>
              And finally, it’s a place to enjoy the company and inspiration of each other.
            </p>
            <p>
              Thank you for your interest in becoming active within your own community.
            </p>
          </div>
        </section>

        <section className={`section--narrow section--centered section--240 ${styles.contactSection}`}> 
          <h2 className={`section__title ${styles.contactTitle}`}>Contact</h2>
          <address className={`prose ${styles.contactDetails}`}>
            <div>Amigos Unite</div>
            <div><a href="https://amigos.unite.com" target="_blank" rel="noopener noreferrer">amigos.unite.com</a></div>
            <div><a href="tel:+16269982531">(626) 998-2531</a></div>
            <div>2301 S Azusa Ave</div>
            <div>West Covina, CA 91792</div>
          </address>
        </section>
      </div>
    </div>
  );
}
