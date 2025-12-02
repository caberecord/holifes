/**
 * Script de Migración: Agregar campos del nuevo Site Builder
 * 
 * Este script agrega los siguientes campos a eventos existentes:
 * - subdomain (generado automáticamente si no existe)
 * - status_site (default: 'draft')
 * - layout_version (default: 1)
 * 
 * USO:
 * 1. Asegúrate de tener las credenciales de Firebase Admin configuradas
 * 2. Ejecuta: npx ts-node scripts/migrate-add-site-builder-fields.ts
 * 
 * NOTA: Este script NO destruye datos existentes, solo agrega campos nuevos
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { generateSubdomain } from '../lib/subdomain/validator';

// Inicializar Firebase Admin
const serviceAccount = require('../firebase-admin-key.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrateEvents() {
    // console.log('🚀 Iniciando migración de eventos...');

    try {
        // Obtener todos los eventos
        const eventsSnapshot = await db.collection('events').get();

        if (eventsSnapshot.empty) {
            // console.log('No hay eventos para migrar.');
            return;
        }

        // console.log(`📊 Encontrados ${eventsSnapshot.size} eventos para procesar`);

        let updatedCount = 0;
        let skippedCount = 0;
        const usedSubdomains = new Set<string>();

        // Batch para actualizar múltiples documentos
        const batch = db.batch();

        for (const doc of eventsSnapshot.docs) {
            const event = doc.data();
            const updates: any = {};
            let needsUpdate = false;

            // 1. Migrar subdomain
            if (!event.subdomain) {
                // Prioridad 1: Usar subdomain de microsite si existe
                if (event.microsite?.subdomain) {
                    updates.subdomain = event.microsite.subdomain;
                }
                // Prioridad 2: Generar desde el nombre del evento
                else {
                    let subdomain = generateSubdomain(event.name || event.title || 'evento');

                    // Asegurar que sea único
                    let counter = 1;
                    while (usedSubdomains.has(subdomain)) {
                        subdomain = `${subdomain}-${counter}`;
                        counter++;
                    }

                    updates.subdomain = subdomain;
                    usedSubdomains.add(subdomain);
                }
                needsUpdate = true;
            } else {
                usedSubdomains.add(event.subdomain);
            }

            // 2. Agregar status_site
            if (!event.status_site) {
                // Si el microsite está habilitado y publicado, marcar como publicado
                if (event.microsite?.enabled && event.microsite?.publishedAt) {
                    updates.status_site = 'published';
                }
                // Si el evento general está publicado, usar draft (el organizador debe publicar manualmente)
                else if (event.status === 'published') {
                    updates.status_site = 'draft';
                }
                // Otros casos: draft
                else {
                    updates.status_site = 'draft';
                }
                needsUpdate = true;
            }

            // 3. Agregar layout_version
            if (!event.layout_version) {
                updates.layout_version = 1;
                needsUpdate = true;
            }

            // 4. Migrar campos de microsite.theme a custom_fields (opcional)
            if (event.microsite?.theme && !event.custom_fields) {
                updates.custom_fields = {
                    legacy_theme: event.microsite.theme
                };
                needsUpdate = true;
            }

            // 5. Agregar event_type si no existe (intentar inferir de category)
            if (!event.event_type && event.category) {
                const categoryMapping: Record<string, string> = {
                    'Música': 'concert',
                    'Conferencia': 'conference',
                    'Taller': 'workshop',
                    'Empresarial': 'corporate',
                    'Religioso': 'religious',
                    'Académico': 'academic',
                    'Deporte': 'sports'
                };

                updates.event_type = categoryMapping[event.category] || 'other';
                needsUpdate = true;
            }

            // Aplicar actualizaciones
            if (needsUpdate) {
                batch.update(doc.ref, updates);
                updatedCount++;
                // console.log(`✅ Evento "${event.name}" → subdomain: ${updates.subdomain || event.subdomain}`);
            } else {
                skippedCount++;
            }
        }

        // Commit batch
        if (updatedCount > 0) {
            await batch.commit();
            // console.log(`\n✨ Migración completada:`);
            // console.log(`   - ${updatedCount} eventos actualizados`);
            // console.log(`   - ${skippedCount} eventos omitidos (ya tenían los campos)`);
        } else {
            // console.log(`\n✅ Todos los eventos ya tienen los campos necesarios`);
        }

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
}

// Ejecutar migración
migrateEvents()
    .then(() => {
        // console.log('\n🎉 Migración finalizada exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migración falló:', error);
        process.exit(1);
    });
