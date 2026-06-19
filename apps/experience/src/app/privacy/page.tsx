import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { LegalDocument } from '@/components/account/LegalDocument';

const PRIVACY_SECTIONS = [
  {
    heading: 'Data Controller',
    body: `PSL One acts as the Data Controller for personal information collected through this platform.\n\nPSL One is committed to protecting your personal information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) of the Republic of South Africa.\n\nFor all privacy enquiries, contact our Data Protection Officer (DPO):\nEmail: dpo@pslone.co.za`,
  },
  {
    heading: 'What Data We Collect',
    body: `We collect the following categories of personal information:\n\n• Identity data: name, display name, email address, phone number\n• Account data: username, password (stored as a secure hash), profile preferences\n• Usage data: pages visited, features used, interaction timestamps\n• Game data: fantasy team selections, predictions, leaderboard rankings, achievements\n• Device data: IP address, browser type and version, operating system\n• Communication data: support tickets, feedback submissions\n\nWe do not collect financial data. PSL One does not process payments or store card details.`,
  },
  {
    heading: 'How We Use It',
    body: `We use your personal information to:\n\n• Provide and maintain the PSL One platform\n• Manage your account and authenticate your identity\n• Operate fantasy football, prediction, and game features\n• Send service notifications, deadline reminders, and updates (if opted in)\n• Improve platform performance and user experience through analytics\n• Respond to support enquiries and bug reports\n• Comply with legal obligations under South African law\n\nWe do not sell your personal data to third parties. We do not use your data for gambling or betting services.`,
  },
  {
    heading: 'POPIA Rights',
    body: `Under the Protection of Personal Information Act (POPIA), you have the following rights regarding your personal data:\n\n• Right of access: Request a copy of personal information we hold about you\n• Right to rectification: Request correction of inaccurate information\n• Right to erasure: Request deletion of your personal data (subject to legal retention requirements)\n• Right to object: Object to certain processing of your personal information\n• Right to data portability: Receive your data in a portable format\n• Right to lodge a complaint: With the Information Regulator of South Africa\n\nInformation Regulator contact: https://www.inforegulator.org.za`,
  },
  {
    heading: 'Data Retention',
    body: `We retain your personal data for as long as your account is active or as needed to provide services.\n\nIf you close your account, we will retain certain data for a period required by law (typically 5 years for financial audit purposes, 3 years for general records).\n\nGame data (fantasy points, predictions, leaderboard history) may be retained in anonymised or aggregate form for platform analytics after account deletion.\n\nYou can request deletion of your personal data at any time. See Account → Delete Account.`,
  },
  {
    heading: 'Contact the DPO',
    body: `For any privacy-related requests, questions, or complaints, contact our Data Protection Officer:\n\nEmail: dpo@pslone.co.za\nSubject line: [POPIA Request] — [Your Request Type]\n\nWe will acknowledge your request within 3 business days and respond fully within 30 days, as required by POPIA.\n\nIf you are not satisfied with our response, you have the right to escalate your complaint to the Information Regulator of South Africa at https://www.inforegulator.org.za.`,
  },
];

/**
 * /privacy — Privacy Policy
 * Placeholder content — legal review pending.
 */
export default function PrivacyPage() {
  return (
    <FantasyShell>
      <LegalDocument
        title="PSL One — Privacy Policy"
        sections={PRIVACY_SECTIONS}
      />
    </FantasyShell>
  );
}
