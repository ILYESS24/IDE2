import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">Conditions d'Utilisation</h1>

        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant Aurion Studio, vous acceptez d'être lié par ces conditions
            d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">2. Description du service</h2>
          <p>
            Aurion Studio fournit une plateforme de développement incluant un éditeur de code,
            un canvas intelligent, un éditeur de texte, un app builder et des agents IA.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">3. Compte utilisateur</h2>
          <p>
            Vous êtes responsable de maintenir la confidentialité de votre compte et de votre
            mot de passe. Vous acceptez de nous informer immédiatement de toute utilisation
            non autorisée de votre compte.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Propriété intellectuelle</h2>
          <p>
            Le contenu, les fonctionnalités et la fonctionnalité d'Aurion Studio sont la propriété
            exclusive d'Aurion Studio et sont protégés par les lois sur la propriété intellectuelle.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">5. Limitation de responsabilité</h2>
          <p>
            Aurion Studio ne sera pas responsable des dommages indirects, accessoires, spéciaux
            ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser nos services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;