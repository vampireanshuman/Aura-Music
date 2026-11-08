export interface ParsedAudioMetadata {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year?: string;
  coverUrl?: string;
  duration?: number;
}

/**
 * Extracts basic ID3v2 tags and embedded album art from audio ArrayBuffer
 */
export async function parseAudioMetadata(file: File): Promise<ParsedAudioMetadata> {
  const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/^[0-9]+[\s._-]+/, '');
  
  // Default values derived from filename (e.g. "Daft Punk - One More Time")
  let title = defaultTitle;
  let artist = 'Unknown Artist';
  let album = 'Local Collection';
  let genre = 'Local Audio';
  let year: string | undefined = undefined;
  let coverUrl: string | undefined = undefined;

  if (defaultTitle.includes(' - ')) {
    const parts = defaultTitle.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  try {
    const buffer = await file.slice(0, 512 * 1024).arrayBuffer(); // Read first 512KB for ID3 header & frames
    const view = new DataView(buffer);

    // Check for ID3 header "ID3"
    if (
      view.byteLength >= 10 &&
      view.getUint8(0) === 0x49 &&
      view.getUint8(1) === 0x44 &&
      view.getUint8(2) === 0x33
    ) {
      const version = view.getUint8(3); // 3 for ID3v2.3, 4 for ID3v2.4
      let offset = 10;
      
      // Calculate tag size (syncsafe integer)
      const tagSize =
        ((view.getUint8(6) & 0x7f) << 21) |
        ((view.getUint8(7) & 0x7f) << 14) |
        ((view.getUint8(8) & 0x7f) << 7) |
        (view.getUint8(9) & 0x7f);

      const maxOffset = Math.min(offset + tagSize, buffer.byteLength - 10);

      while (offset < maxOffset) {
        // Read 4-character Frame ID
        const frameId = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2),
          view.getUint8(offset + 3)
        );

        if (!/^[A-Z0-9]{4}$/.test(frameId)) {
          break; // reached padding or invalid frame
        }

        let frameSize = 0;
        if (version === 4) {
          // syncsafe integer in ID3v2.4
          frameSize =
            ((view.getUint8(offset + 4) & 0x7f) << 21) |
            ((view.getUint8(offset + 5) & 0x7f) << 14) |
            ((view.getUint8(offset + 6) & 0x7f) << 7) |
            (view.getUint8(offset + 7) & 0x7f);
        } else {
          // 32-bit uint in ID3v2.3
          frameSize = view.getUint32(offset + 4);
        }

        offset += 10; // header size
        if (frameSize <= 0 || offset + frameSize > buffer.byteLength) {
          break;
        }

        const frameBuffer = buffer.slice(offset, offset + frameSize);

        if (frameId === 'TIT2') {
          title = decodeTextFrame(frameBuffer) || title;
        } else if (frameId === 'TPE1' || frameId === 'TPE2') {
          artist = decodeTextFrame(frameBuffer) || artist;
        } else if (frameId === 'TALB') {
          album = decodeTextFrame(frameBuffer) || album;
        } else if (frameId === 'TCON') {
          genre = decodeTextFrame(frameBuffer) || genre;
        } else if (frameId === 'TYER' || frameId === 'TDRC') {
          year = decodeTextFrame(frameBuffer) || year;
        } else if (frameId === 'APIC') {
          // Embedded album art
          const picture = extractAPIC(frameBuffer);
          if (picture) {
            coverUrl = picture;
          }
        }

        offset += frameSize;
      }
    }
  } catch (err) {
    console.warn('ID3 parsing skipped or failed gracefully:', err);
  }

  // Get duration by temporarily loading an audio element
  let duration = 0;
  try {
    duration = await getAudioDuration(file);
  } catch {
    duration = 180; // fallback 3 minutes
  }

  return {
    title,
    artist,
    album,
    genre,
    year,
    coverUrl,
    duration,
  };
}

function decodeTextFrame(buffer: ArrayBuffer): string {
  if (buffer.byteLength <= 1) return '';
  const view = new Uint8Array(buffer);
  const encoding = view[0];
  const bytes = view.slice(1);

  try {
    if (encoding === 0) {
      // ISO-8859-1
      return new TextDecoder('latin1').decode(bytes).replace(/\0.*$/g, '').trim();
    } else if (encoding === 1) {
      // UTF-16 with BOM
      return new TextDecoder('utf-16').decode(bytes).replace(/\0.*$/g, '').trim();
    } else if (encoding === 2) {
      // UTF-16BE without BOM
      return new TextDecoder('utf-16be').decode(bytes).replace(/\0.*$/g, '').trim();
    } else {
      // UTF-8
      return new TextDecoder('utf-8').decode(bytes).replace(/\0.*$/g, '').trim();
    }
  } catch {
    return '';
  }
}

function extractAPIC(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10) return null;

  let offset = 1; // skip encoding byte
  // MIME type is null-terminated string
  let mimeEnd = offset;
  while (mimeEnd < bytes.length && bytes[mimeEnd] !== 0) {
    mimeEnd++;
  }
  const mimeType = new TextDecoder('latin1').decode(bytes.slice(offset, mimeEnd)) || 'image/jpeg';
  offset = mimeEnd + 1;

  // skip picture type byte
  offset += 1;

  // skip description string (null-terminated according to encoding)
  while (offset < bytes.length && bytes[offset] !== 0) {
    offset++;
  }
  offset++; // skip null terminator

  // remaining bytes are the image data
  const imageData = bytes.slice(offset);
  if (imageData.length > 0) {
    const blob = new Blob([imageData], { type: mimeType });
    return URL.createObjectURL(blob);
  }
  return null;
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    audio.preload = 'metadata';

    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
    };

    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      cleanUp();
      resolve(isNaN(dur) ? 180 : dur);
    };

    audio.onerror = () => {
      cleanUp();
      resolve(180);
    };

    setTimeout(() => {
      cleanUp();
      resolve(180);
    }, 2500);
  });
}
