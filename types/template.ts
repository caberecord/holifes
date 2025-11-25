export interface SiteTemplate {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    category: 'concert' | 'conference' | 'festival' | 'general' | 'corporate';
    layout_data: any; // Puck JSON payload
    is_active: boolean;
    createdAt?: any;
}
