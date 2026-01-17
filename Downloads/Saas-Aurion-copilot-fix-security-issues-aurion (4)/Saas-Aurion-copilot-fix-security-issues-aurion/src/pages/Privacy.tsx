import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">Politique de Confidentialité</h1>

        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">1. Collecte des données</h2>
          <p>
            Aurion Studio collecte des informations personnelles lorsque vous utilisez nos services,
            créez un compte ou interagissez avec notre plateforme. Ces données peuvent inclure votre
            nom, adresse email, et informations de connexion.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">2. Utilisation des données</h2>
          <p>
            Nous utilisons vos données pour fournir, maintenir et améliorer nos services,
            communiquer avec vous concernant votre compte, et assurer la sécurité de notre plateforme.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">3. Protection des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données
            contre l'accès non autorisé, la modification, la divulgation ou la destruction.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression
            et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">5. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité, contactez-nous à :
            contact@aurion.studio
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;