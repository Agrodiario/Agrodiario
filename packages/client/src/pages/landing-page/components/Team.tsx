import styles from "./Team.module.css";
import aline from '@/assets/aline.jpg';
import ana from '@/assets/ana.jpeg';
import enzo from '@/assets/enzo.jpg';
import sophia from '@/assets/sophia.jpg';
import victor from '@/assets/victor.jpg';
import igor from '@/assets/igor.jpg';
import re from '@/assets/re.jpg';
import ivanilton from '@/assets/ivanilton.jpg';
import { IconBrandLinkedinFilled } from "@tabler/icons-react";

export function Team() {
    const teamMembers = [
        {
            name: "Aline Nakazawa",
            title: "Mestranda em Ciência da Computação (IME-USP)",
            image: aline,
            linkedin: "https://www.linkedin.com/in/alinenakazawa/",
        },
        {
            name: "Ana Carla Quallio Rosa",
            title: "Mestranda em Ciência da Computação (IME-USP)",
            image: ana,
            linkedin: "https://www.linkedin.com/in/ana-carla-quallio-rosa/",
        },
        {
            name: "Enzo Spinella",
            title: "Estudante de Ciência da Computação (IME-USP)",
            image: enzo,
            linkedin: "https://www.linkedin.com/in/enzo-spinella/",
        },
        {
            name: "Sophia Gutruf",
            title: "Estudante de Ciência da Computação (IME-USP)",
            image: sophia,
            linkedin: "https://www.linkedin.com/in/sophia-gutruf",
        },
        {
            name: "Victor Feitosa",
            title: "Estudante de Ciência da Computação (IME-USP)",
            image: victor,
            linkedin: "https://www.linkedin.com/in/victor-feitosa-182477b4/",
        },
        {
            name: "Igor Wiese",
            title: "Doutor em Ciência da Computação (IME-USP)",
            image: igor,
            linkedin: "https://br.linkedin.com/in/igor-wiese-214ab85b",
        },
        {
            name: "Reginaldo Ré",
            title: "Doutor em Ciência da Computação (ICMC-USP)",
            image: re,
            linkedin: "https://br.linkedin.com/in/reginaldo-r%C3%A9-0328aa30",
        },
        {
            name: "Ivanilton Polato",
            title: "Doutor em Ciência da Computação (IME-USP)",
            image: ivanilton,
            linkedin: "https://www.utfpr.edu.br/cursos/coordenacoes/stricto-sensu/ppgcc-cm/area-academica1/docentes/ivanilton-polato",
        },
    ];

    return (
        <section id="quem-somos" className={styles.comoFunciona}>
            <div className={styles.header}>
                <h2 className={styles.title}>Quem somos</h2>
                <p className={styles.subtitle}>Conheça as pessoas por detrás do projeto</p>
            </div>

            <div className={styles.teamContainer}>
                {teamMembers.map((member, index) => (
                    <div key={index} className={styles.teamCard}>
                        <div className={styles.teamAvatar}>
                            <img src={member.image} alt={member.name} />
                        </div>

                        <div className={styles.teamInfo}>
                            <h3 className={styles.teamName}>{member.name}</h3>
                            <p className={styles.teamTitle}>{member.title}</p>

                            <div className={styles.teamSocial}>
                                <div className={styles.teamSocial}>
                                    <a
                                        href={member.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.socialIcon}
                                    >
                                        <IconBrandLinkedinFilled size={24} stroke={1.5} />
                                    </a>
                                </div>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
