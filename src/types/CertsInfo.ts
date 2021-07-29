export interface CertsInfo {
  secretName: string;
  dnsNames: String[];
  issuer: string;
  subject: string;
  notBefore: string;
  notAfter: string;
  error: string;
}
