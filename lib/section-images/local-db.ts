import { formatUploadDate } from "@/lib/section-images/format";
import type { SectionImageRecord } from "@/lib/section-images/types";

const DB_NAME = "kohinoor-decorations";
const DB_VERSION = 1;
const META_STORE = "section-image-meta";
const BLOB_STORE = "section-image-blobs";

type StoredMeta = Omit<SectionImageRecord, "previewUrl">;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error);
      })
  );
}

export async function loadLocalSectionImages(
  section: string
): Promise<SectionImageRecord[]> {
  const allMeta = await transaction<StoredMeta[]>(
    META_STORE,
    "readonly",
    (store) => store.getAll()
  );

  const sectionMeta = allMeta.filter((m) => m.id.startsWith(`${section}:`));

  const records: SectionImageRecord[] = [];
  for (const meta of sectionMeta) {
    const blob = await transaction<Blob | undefined>(
      BLOB_STORE,
      "readonly",
      (store) => store.get(meta.id)
    );
    if (!blob) continue;
    records.push({
      ...meta,
      uploadDate: formatUploadDate(new Date(meta.uploadDate)),
      previewUrl: URL.createObjectURL(blob),
    });
  }

  return records.sort(
    (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );
}

export async function saveLocalSectionImage(
  section: string,
  file: File,
  title: string
): Promise<SectionImageRecord> {
  const id = `${section}:${crypto.randomUUID()}`;
  const meta: StoredMeta = {
    id,
    title,
    fileName: file.name,
    sizeBytes: file.size,
    uploadDate: new Date().toISOString(),
  };

  await transaction(META_STORE, "readwrite", (store) => store.put(meta));
  await transaction(BLOB_STORE, "readwrite", (store) => store.put(file, id));

  return {
    ...meta,
    uploadDate: formatUploadDate(new Date(meta.uploadDate)),
    previewUrl: URL.createObjectURL(file),
  };
}

export async function updateLocalSectionImageTitle(
  id: string,
  title: string
): Promise<void> {
  const meta = await transaction<StoredMeta | undefined>(
    META_STORE,
    "readonly",
    (store) => store.get(id)
  );
  if (!meta) return;
  await transaction(META_STORE, "readwrite", (store) =>
    store.put({ ...meta, title })
  );
}

export async function deleteLocalSectionImage(id: string): Promise<void> {
  await transaction(META_STORE, "readwrite", (store) => store.delete(id));
  await transaction(BLOB_STORE, "readwrite", (store) => store.delete(id));
}
