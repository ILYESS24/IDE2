import React from "react";
import { LegalLayout } from "../components/layout/LegalLayout";

const GDPR: React.FC = () => {
  return (
    <LegalLayout 
      title="GDPR Compliance" 
      subtitle="Our commitment to General Data Protection Regulation."
      lastUpdated="December 14, 2025"
    >
      <section className="mb-8">
        <h2>1. Overview</h2>
        <p>
          AURION is committed to compliance with the General Data Protection Regulation (GDPR), which applies to the processing of personal data of individuals in the European Economic Area (EEA).
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Data Subject Rights</h2>
        <p>Under GDPR, you have the following rights:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Right to Access:</strong> Request copies of your personal data.</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate data.</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("Right to be Forgotten").</li>
          <li><strong>Right to Restrict Processing:</strong> Request restriction of processing your data.</li>
          <li><strong>Right to Data Portability:</strong> Request transfer of your data to another organization.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>3. Data Processing</h2>
        <p>
          We process personal data only when we have a lawful basis to do so, such as your consent, the necessity to perform a contract, or our legitimate interests.
        </p>
      </section>

      <section className="mb-8">
        <h2>4. Contact DPO</h2>
        <p>
          To exercise your rights or contact our Data Protection Officer, please email <a href="mailto:dpo@aurion.ai" className="text-blue-600 hover:underline">dpo@aurion.ai</a>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default GDPR;
