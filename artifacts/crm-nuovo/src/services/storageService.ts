import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { storage, db, auth } from '@/lib/firebase';
import { CRMFile } from '@/types/crm';

export const storageService = {
  /**
   * Uploads a file to Firebase Storage and saves metadata to Firestore
   */
  async uploadFile(
    file: File, 
    relatedToId: string, 
    relatedToType: 'deal' | 'contact' | 'company',
    category: CRMFile['category'] = 'document'
  ): Promise<CRMFile> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storagePath = `crm/${relatedToType}s/${relatedToId}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          const fileMetadata: Omit<CRMFile, 'id'> = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: downloadUrl,
            path: storagePath,
            related_to_id: relatedToId,
            related_to_type: relatedToType,
            uploaded_by: user.uid,
            uploaded_by_name: user.displayName || user.email || 'Unknown',
            created_at: new Date().toISOString(),
            category
          };

          const docRef = await addDoc(collection(db, 'crm_files'), fileMetadata);
          resolve({ id: docRef.id, ...fileMetadata } as CRMFile);
        }
      );
    });
  },

  /**
   * Fetches file list for a specific record
   */
  async getFiles(relatedToId: string, relatedToType: string): Promise<CRMFile[]> {
    const q = query(
      collection(db, 'crm_files'),
      where('related_to_id', '==', relatedToId),
      where('related_to_type', '==', relatedToType),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMFile));
  },

  /**
   * Deletes a file from Storage and its metadata from Firestore
   */
  async deleteFile(fileId: string, storagePath: string): Promise<void> {
    // Delete from Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);

    // Delete from Firestore
    await deleteDoc(doc(db, 'crm_files', fileId));
  }
};
