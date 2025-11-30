// Company and Fiscal Data Types for Latin American Countries

export type CountryCode =
    | 'AR' // Argentina
    | 'BO' // Bolivia
    | 'BR' // Brazil
    | 'CL' // Chile
    | 'CO' // Colombia
    | 'CR' // Costa Rica
    | 'EC' // Ecuador
    | 'SV' // El Salvador
    | 'GT' // Guatemala
    | 'HN' // Honduras
    | 'MX' // Mexico
    | 'NI' // Nicaragua
    | 'PA' // Panama
    | 'PY' // Paraguay
    | 'PE' // Peru
    | 'UY' // Uruguay
    | 'VE'; // Venezuela

export type FiscalDocumentType =
    | 'CUIT' // Argentina
    | 'NIT'  // Bolivia, Colombia, Guatemala, El Salvador
    | 'CNPJ' // Brazil
    | 'RUT'  // Chile, Uruguay
    | 'CJ'   // Costa Rica - Cédula Jurídica
    | 'RUC'  // Ecuador, Nicaragua, Panama, Paraguay, Peru
    | 'RTN'  // Honduras
    | 'RFC'  // Mexico
    | 'RIF'; // Venezuela

export type TaxRegime =
    | 'general'
    | 'simplified'
    | 'monotax'
    | 'small_business'
    | 'exempt';

export interface CountryFiscalInfo {
    code: CountryCode;
    name: string;
    documentType: FiscalDocumentType;
    documentName: string;
    defaultVAT: number; // Default VAT rate
}

export const LATIN_AMERICAN_COUNTRIES: CountryFiscalInfo[] = [
    { code: 'AR', name: 'Argentina', documentType: 'CUIT', documentName: 'CUIT', defaultVAT: 21 },
    { code: 'BO', name: 'Bolivia', documentType: 'NIT', documentName: 'NIT', defaultVAT: 13 },
    { code: 'BR', name: 'Brasil', documentType: 'CNPJ', documentName: 'CNPJ', defaultVAT: 17 },
    { code: 'CL', name: 'Chile', documentType: 'RUT', documentName: 'RUT', defaultVAT: 19 },
    { code: 'CO', name: 'Colombia', documentType: 'NIT', documentName: 'NIT', defaultVAT: 19 },
    { code: 'CR', name: 'Costa Rica', documentType: 'CJ', documentName: 'Cédula Jurídica', defaultVAT: 13 },
    { code: 'EC', name: 'Ecuador', documentType: 'RUC', documentName: 'RUC', defaultVAT: 12 },
    { code: 'SV', name: 'El Salvador', documentType: 'NIT', documentName: 'NIT', defaultVAT: 13 },
    { code: 'GT', name: 'Guatemala', documentType: 'NIT', documentName: 'NIT', defaultVAT: 12 },
    { code: 'HN', name: 'Honduras', documentType: 'RTN', documentName: 'RTN', defaultVAT: 15 },
    { code: 'MX', name: 'México', documentType: 'RFC', documentName: 'RFC', defaultVAT: 16 },
    { code: 'NI', name: 'Nicaragua', documentType: 'RUC', documentName: 'RUC', defaultVAT: 15 },
    { code: 'PA', name: 'Panamá', documentType: 'RUC', documentName: 'RUC', defaultVAT: 7 },
    { code: 'PY', name: 'Paraguay', documentType: 'RUC', documentName: 'RUC', defaultVAT: 10 },
    { code: 'PE', name: 'Perú', documentType: 'RUC', documentName: 'RUC', defaultVAT: 18 },
    { code: 'UY', name: 'Uruguay', documentType: 'RUT', documentName: 'RUT', defaultVAT: 22 },
    { code: 'VE', name: 'Venezuela', documentType: 'RIF', documentName: 'RIF', defaultVAT: 16 },
];

export interface CompanyData {
    // Basic Information
    legalName: string;              // Razón Social
    tradeName?: string;             // Nombre Comercial
    logoUrl?: string;               // URL del logo

    // Fiscal Information
    country: CountryCode;
    fiscalDocumentType: FiscalDocumentType;
    fiscalDocumentNumber: string;   // Número de identificación fiscal

    // Address
    fiscalAddress: string;          // Dirección fiscal completa
    city: string;
    postalCode?: string;

    // Contact
    phone: string;
    billingEmail: string;           // Email para facturación

    // Tax Configuration
    vatEnabled: boolean;            // ¿Cobra IVA?
    vatRate: number;                // Tarifa de IVA (%)
    taxRegime: TaxRegime;           // Régimen fiscal

    // Integrations
    alegra?: AlegraConfig;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

export interface AlegraConfig {
    isConnected: boolean;
    email: string;
    token: string;          // Stored securely (or masked in UI)
    isSandbox: boolean;
    bankAccountId?: number; // ID de la cuenta de banco en Alegra
    warehouseId?: number;   // ID de la bodega (opcional)
}
