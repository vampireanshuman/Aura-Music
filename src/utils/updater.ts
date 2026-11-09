/**
 * Aura Music OTA Software Updater
 * Checks GitHub Releases for new APK versions and provides seamless in-place updates.
 */

export const APP_VERSION = '1.0.5';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  apkDownloadUrl: string | null;
  apkSize: number | null;
  htmlUrl: string;
}

/**
 * Compare two semver strings (e.g. "1.0.5" vs "1.0.4").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/i, '').trim();
  const parts1 = clean(v1).split('.').map(n => parseInt(n, 10) || 0);
  const parts2 = clean(v2).split('.').map(n => parseInt(n, 10) || 0);

  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '3.4 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

export function isAutoUpdateCheckEnabled(): boolean {
  try {
    const val = localStorage.getItem('aura_auto_update_check');
    return val !== 'false'; // default to true
  } catch {
    return true;
  }
}

export function setAutoUpdateCheckEnabled(enabled: boolean): void {
  try {
    localStorage.setItem('aura_auto_update_check', enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * Query GitHub Releases API for the latest release
 */
export async function checkForAppUpdate(): Promise<UpdateInfo> {
  const endpoint = 'https://api.github.com/repos/vampireanshuman/Aura-Music/releases/latest';

  const response = await fetch(endpoint, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to check updates (HTTP ${response.status})`);
  }

  const data = await response.json();
  const tag = (data.tag_name || '').replace(/^v/i, '');
  const hasUpdate = compareSemver(tag, APP_VERSION) > 0;

  // Find APK asset
  const assets: Array<{ name: string; size: number; browser_download_url: string }> = Array.isArray(data.assets) 
    ? data.assets 
    : [];
  
  const apkAsset = assets.find(a => a.name.toLowerCase().endsWith('.apk'));

  return {
    currentVersion: APP_VERSION,
    latestVersion: tag || APP_VERSION,
    hasUpdate,
    releaseName: data.name || `Aura Music v${tag}`,
    releaseNotes: data.body || 'Performance optimizations, bug fixes, and flagship audio enhancements.',
    publishedAt: data.published_at || new Date().toISOString(),
    apkDownloadUrl: apkAsset ? apkAsset.browser_download_url : (data.html_url || null),
    apkSize: apkAsset ? apkAsset.size : null,
    htmlUrl: data.html_url || 'https://github.com/vampireanshuman/Aura-Music/releases'
  };
}
