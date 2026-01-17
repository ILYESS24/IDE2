import React from "react";
import { LegalLayout } from "../components/layout/LegalLayout";

const LegalNotice: React.FC = () => {
  return (
    <LegalLayout 
      title="Legal Notice" 
      subtitle="Corporate information and legal disclosures."
      lastUpdated="December 14, 2025"
    >
      <section className="mb-8">
        <h2>1. Publisher</h2>
        <p>
          <strong>AURION Inc.</strong><br />
          123 AI Boulevard<br />
          San Francisco, CA 94107<br />
          United States
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Contact</h2>
        <p>
          Email: <a href="mailto:contact@aurion.ai" className="text-blue-600 hover:underline">contact@aurion.ai</a><br />
          Phone: +1 (555) 123-4567
        </p>
      </section>

      <section className="mb-8">
        <h2>3. Hosting</h2>
        <p>
          This website is hosted by Cloudflare, Inc.<br />
          101 Townsend St,<br />
          San Francisco, CA 94107
        </p>
      </section>

      <section className="mb-8">
        <h2>4. Intellectual Property</h2>
        <p>
          All content on this website, including text, graphics, logos, and software, is the property of AURION Inc. or its licensors and is protected by copyright laws.
        </p>
      </section>
    </LegalLayout>
  );
};

export default LegalNotice;
