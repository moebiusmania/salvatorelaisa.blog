import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import { PageSeo } from '@/components/SEO'

export default function About() {
  return (
    <>
      <PageSeo
        title={`About - ${siteMetadata.author}`}
        description={`About me - ${siteMetadata.author}`}
        url={`${siteMetadata.siteUrl}/about`}
      />
      <div className="divide-y">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            About
          </h1>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center pt-8 space-x-2">
            <img
              src={siteMetadata.image}
              alt="avatar"
              width="192px"
              height="192px"
              className="w-48 h-48 rounded-full"
            />
            <h3 className="pt-4 pb-2 text-2xl font-bold leading-8 tracking-tight">
              {siteMetadata.author}
            </h3>
            <div className="text-gray-500 dark:text-gray-400">
              T-Shaped developer, bass player, kung fu practionist
            </div>
            <div className="text-gray-500 dark:text-gray-400">Milano, Italy</div>
          </div>
          <div className="pt-8 pb-8 prose dark:prose-dark max-w-none xl:col-span-2">
            <p>
              Da piccolo volevo fare l'inventore, poi il programmatore ma a metà del 2000 mi sono
              ritrovato web designer, poi evoluto in frontend developer. E chissà cos'altro
              diventerò in futuro... <i>[semi-cit]</i>
            </p>
            <h3>Perché un blog?</h3>
            <p>
              Mi è sempre piaciutà l'idea che il web offrisse spazi di espressione per tutti, motivo
              per cui sono sempre stato attratto dai blog, partendo dal mio primissimo su Splinder a
              metà 2003 (<i>quanti ricordi</i>), passando poi da WordPress fino ad arrivare a
              questo. Anche se purtroppo oggi i blog hanno un ruolo e un impatto completamente
              diverso nel nostro quotidiano, rimango fedele alla visione originale{' '}
              <span role="img" aria-label="nerd smile">
                🤓
              </span>
              , motivo per cui anche se scrivo di rado e in maniera decisamente non continuativa,
              insisto nel tenermi il mio pezzettino di www.
            </p>
            <h3>Disclaimer</h3>
            <ul>
              <li>
                I contenuti di questo blog sono esclusivamente opinioni personali, pensieri e
                recensioni in ordine sparso.
              </li>
              <li>
                La pubblicazione di nuovi articoli o aggiornamenti di esistenti è puramente
                saltuaria e non pianificata.
              </li>
              <li>
                Le recensioni che scrivo non sono sponsorizzate o basate su qualcosa di "regalato",
                ma bensì derivano da oggetti ottenuti grazie al mio povero portafoglio.
              </li>
              <li>
                Foto e video pubblicati negli articoli se non sono di mia creazione sono sempre
                embeddati o linkati dai rispettivi servizi o domini originali.
              </li>
            </ul>
            <p>
              Se <strong>non</strong> siete d'accordo su qualcosa, e ci sta, basta premere il
              tastino per chiudere la tab.
            </p>
            <h3>Privacy policy</h3>
            <p>
              Non necessaria, dato che non sto tracciando il alcun modo le pagine di questo blog{' '}
              <span role="img" aria-label="smile">
                🙂
              </span>
              , tuttavia ricordo che le piattaforme da cui faccio embed di contenuti (
              <i>YouTube, Instagram, ecc</i>) eseguono sempre qualche forma di tracciamento, ma
              appunto, non dipendono da me o da questo sito.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
