import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an image to Firebase Storage
 * @param file The file to upload
 * @param path The path in storage (e.g., 'events/123/hero.jpg')
 * @returns The download URL of the uploaded image
 */
export async function uploadImage(file: File, path: string): Promise<string> {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}
