import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { LegalDocument } from '@/components/account/LegalDocument';

const TERMS_SECTIONS = [
  {
    heading: 'Acceptance of Terms',
    body: `By accessing or using PSL One, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you may not use the platform.\n\nPSL One reserves the right to update or modify these terms at any time without prior notice. Your continued use of the platform following any changes constitutes your acceptance of the new terms.`,
  },
  {
    heading: 'Use of Service',
    body: `PSL One is a digital sports engagement platform providing live match data, fantasy football, predictions, and club content for football fans.\n\nYou agree to use the service only for lawful purposes and in a way that does not infringe the rights of others. You must be at least 13 years of age to use PSL One. Users under 18 require parental consent.\n\nYou are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`,
  },
  {
    heading: 'Fantasy Game Rules',
    body: `PSL One fantasy football and prediction games are for entertainment purposes only. All points, fan value, achievements, and leaderboard rankings are non-monetary. They have no cash value and cannot be redeemed for money or prizes unless explicitly stated in a separate promotional offer.\n\nNo gambling. No betting. No wagering. No real money is involved in any game mechanic on PSL One.\n\nPSL One reserves the right to suspend or adjust scores in the event of data errors, match abandonments, or system issues.`,
  },
  {
    heading: 'Intellectual Property',
    body: `All content on PSL One — including text, graphics, logos, icons, and software — is the property of PSL One or its licensors and is protected by South African and international copyright law.\n\nYou may not reproduce, distribute, modify, or create derivative works without the express written consent of PSL One. Club crests, player images, and competition branding remain the property of their respective rights holders.`,
  },
  {
    heading: 'Privacy',
    body: `Your privacy matters. PSL One collects and processes personal data in accordance with our Privacy Policy and the Protection of Personal Information Act (POPIA).\n\nBy using PSL One, you consent to the collection and use of information as described in our Privacy Policy. Please read our Privacy Policy carefully before using the platform.`,
  },
  {
    heading: 'Limitation of Liability',
    body: `PSL One is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or free of viruses.\n\nTo the maximum extent permitted by law, PSL One and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.\n\nLive match data, scores, and statistics are sourced from third-party providers. PSL One does not guarantee the accuracy or completeness of this data.`,
  },
  {
    heading: 'Governing Law',
    body: `These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the South African courts.\n\nThe Electronic Communications and Transactions Act 25 of 2002 (ECT Act) applies to the use of this platform.`,
  },
  {
    heading: 'Contact',
    body: `If you have any questions about these Terms and Conditions, please contact us:\n\nPSL One\nEmail: legal@pslone.co.za\nPostal: [Address pending — legal review required]\n\nFor general support enquiries, visit our Help section or email support@pslone.co.za.`,
  },
];

/**
 * /terms — Terms & Conditions
 * Placeholder content — legal review pending.
 */
export default function TermsPage() {
  return (
    <FantasyShell>
      <LegalDocument
        title="PSL One — Terms and Conditions"
        sections={TERMS_SECTIONS}
      />
    </FantasyShell>
  );
}
