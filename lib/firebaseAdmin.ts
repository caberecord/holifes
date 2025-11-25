import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
try {
    if (!admin.apps.length) {
        const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
        });

        // Configuración crítica para evitar errores con propiedades undefined en Puck
        admin.firestore().settings({
            ignoreUndefinedProperties: true,
        });
    }
} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
}

// Exportar instancias de manera segura (pueden ser undefined si falla la inicialización)
// Esto evita que la aplicación se rompa al importar este archivo si hay un error de configuración
// Exportar instancias de manera segura (pueden ser undefined si falla la inicialización)
// Esto evita que la aplicación se rompa al importar este archivo si hay un error de configuración
// Usamos casting para mantener la inferencia de tipos en el resto de la app, aunque sea un objeto vacío en caso de error
export const adminAuth = (admin.apps.length ? admin.auth() : {}) as admin.auth.Auth;
export const adminDb = (admin.apps.length ? admin.firestore() : {}) as admin.firestore.Firestore;
export const adminStorage = (admin.apps.length ? admin.storage() : {}) as admin.storage.Storage;

export default admin;
