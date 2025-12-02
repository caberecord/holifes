export type PermissionAction =
    | 'event.create'
    | 'event.edit'
    | 'event.delete'
    | 'event.view_audit'
    | 'team.manage'
    | 'finance.view'
    | 'settings.manage';

export interface RoleDefinition {
    id: string;
    name: string;
    description: string;
    permissions: PermissionAction[];
    isSystem?: boolean; // Roles predeterminados que no se pueden borrar (Admin, Owner)
}

export const DEFAULT_ROLES: RoleDefinition[] = [
    {
        id: 'owner',
        name: 'Propietario',
        description: 'Acceso total a todas las funciones.',
        permissions: ['event.create', 'event.edit', 'event.delete', 'event.view_audit', 'team.manage', 'finance.view', 'settings.manage'],
        isSystem: true
    },
    {
        id: 'admin',
        name: 'Administrador',
        description: 'Gestiona eventos y equipo, pero no facturación crítica.',
        permissions: ['event.create', 'event.edit', 'event.view_audit', 'team.manage'],
        isSystem: true
    },
    {
        id: 'editor',
        name: 'Editor',
        description: 'Puede editar eventos pero no borrarlos ni gestionar equipo.',
        permissions: ['event.create', 'event.edit', 'event.view_audit'],
        isSystem: true
    },
    {
        id: 'viewer',
        name: 'Visualizador',
        description: 'Solo lectura.',
        permissions: [],
        isSystem: true
    }
];
