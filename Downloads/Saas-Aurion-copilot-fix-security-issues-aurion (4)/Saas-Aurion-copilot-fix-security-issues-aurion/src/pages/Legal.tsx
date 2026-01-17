import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Legal = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">Mentions Légales</h1>

        <div className="space-y-6 text-white/70 leading-relaxed">
          <h2 className="text-2xl font-semibold text-white mt-8">1. Éditeur du site</h2>
          <p>
            <strong className="text-white">Aurion Studio</strong><br />
            Société par actions simplifiée<br />
            Adresse : [Adresse de l'entreprise]<br />
            Email : contact@aurion.studio
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">2. Directeur de la publication</h2>
          <p>
            [Nom du directeur de publication]
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">3. Hébergeur</h2>
          <p>
            [Nom de l'hébergeur]<br />
            [Adresse de l'hébergeur]<br />
            [Téléphone de l'hébergeur]
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le
            droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont
            réservés, y compris pour les documents téléchargeables et les représentations
            iconographiques et photographiques.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">5. Données personnelles</h2>
          <p>
            Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au
            Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit
            d'accès, de rectification et de suppression des données vous concernant.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Legal;