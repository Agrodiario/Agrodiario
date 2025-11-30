import styles from "./Affiliation.module.css";

import usp from "@/assets/usp.svg";
import ime from "@/assets/ime.svg";
import utfpr from "@/assets/utfpr.png";

export function Affiliation() {
  const partners = [
    { name: "USP", image: usp },
    { name: "IME-USP", image: ime },
    { name: "UTFPR", image: utfpr },
  ];

  return (
    <section className={styles.partners} id="parceiros">
      <h2 className={styles.partnersTitle}>Nossos parceiros</h2>
      <p className={styles.partnersSubtitle}>
        Conheça as instituições por de trás do projeto
      </p>

      <div className={styles.partnersLogos}>
        {partners.map((partner, index) => (
          <div key={index} className={styles.partnerLogo}>
            <img src={partner.image} alt={partner.name} />
          </div>
        ))}
      </div>
    </section>
  );
}
