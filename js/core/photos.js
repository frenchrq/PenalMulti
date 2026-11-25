// Player photos chosen by the parent. They are stored ONLY in this browser (IndexedDB),
// never in the repository and never sent anywhere. Each photo is shrunk to a small square.
const DB = 'penalmulti';
const STORE = 'photos';
const OK = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_LEN = 600000; // characters of the data URL

function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

// { playerId: dataUrl }
export async function getAll() {
  try {
    const db = await open();
    return await new Promise((res, rej) => {
      const out = {};
      const rq = db.transaction(STORE).objectStore(STORE).openCursor();
      rq.onsuccess = () => {
        const c = rq.result;
        if (c) { if (typeof c.value === 'string' && OK.test(c.value)) out[c.key] = c.value; c.continue(); } else res(out);
      };
      rq.onerror = () => rej(rq.error);
    });
  } catch (e) {
    return {};
  }
}

export async function put(id, dataUrl) {
  if (typeof dataUrl !== 'string' || dataUrl.length > MAX_LEN || !OK.test(dataUrl)) throw new Error('bad image');
  const db = await open();
  await new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(dataUrl, id);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}

export async function remove(id) {
  const db = await open();
  await new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}

// Reads an image file and returns a 240x240 JPEG data URL, cropped to a square
// that leans toward the top of the picture (faces are usually there).
export function fileToThumb(file, size = 240) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2, sy = (img.height - s) * 0.2;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d').drawImage(img, sx, sy, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('No se pudo leer la imagen')); };
    img.src = url;
  });
}

// Backup file so photos can be moved to another device.
export async function exportJSON() {
  return JSON.stringify({ app: 'penalmulti', v: 1, photos: await getAll() });
}

// Returns how many photos were loaded. Only known player ids and valid images are accepted.
export async function importJSON(text, allowedIds) {
  const o = JSON.parse(text);
  if (!o || typeof o.photos !== 'object' || o.photos === null) throw new Error('Archivo no válido');
  let n = 0;
  for (const k of Object.keys(o.photos)) {
    if (!allowedIds.includes(k)) continue;
    try { await put(k, o.photos[k]); n++; } catch (e) { /* skip bad entry */ }
  }
  return n;
}
