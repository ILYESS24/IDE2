import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">Politique des Cookies</h1>

        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">1. Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez
            notre site web. Les cookies nous permettent de reconnaître votre navigateur et de
            mémoriser certaines informations.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">2. Types de cookies utilisés</h2>
          <p>
            <strong className="text-white">Cookies essentiels :</strong> Nécessaires au fonctionnement du site.
          </p>
          <p>
            <strong className="text-white">Cookies de performance :</strong> Nous aident à comprendre comment
            les visiteurs interagissent avec notre site.
          </p>
          <p>
            <strong className="text-white">Cookies fonctionnels :</strong> Permettent de mémoriser vos préférences.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">3. Gestion des cookies</h2>
          <p>
            Vous pouvez configurer votre navigateur pour refuser les cookies ou vous alerter
            lorsque des cookies sont envoyés. Notez que certaines parties de notre service
            peuvent ne pas fonctionner correctement si vous désactivez les cookies.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Durée de conservation</h2>
          <p>
            Les cookies de session sont supprimés à la fermeture du navigateur. Les cookies
            persistants restent sur votre appareil pendant une période définie ou jusqu'à ce
            que vous les supprimiez.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cookies;