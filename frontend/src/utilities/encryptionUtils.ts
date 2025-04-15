/**
 * Encryption utilities using the Web Crypto API for secure storage of MQTT broker credentials
 */

// Convert string to Uint8Array for encryption
const str2ab = (str: string): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Convert ArrayBuffer back to string after decryption
const ab2str = (buf: ArrayBuffer): string => {
  const decoder = new TextDecoder();
  return decoder.decode(buf);
};

// Generate encryption key from a password
const getKeyFromPassword = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    str2ab(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

// Encrypt data
export const encryptData = async (data: string, secretKey: string): Promise<string> => {
  // Generate a random salt
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  // Generate a random initialization vector
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await getKeyFromPassword(secretKey, salt);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    str2ab(data)
  );

  // Combine salt, iv, and encrypted data for storage
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...Array.from(result)));
};

// Decrypt data
export const decryptData = async (encryptedData: string, secretKey: string): Promise<string> => {
  try {
    // Convert from base64
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extract the salt, iv, and encrypted data
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);

    const key = await getKeyFromPassword(secretKey, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      encrypted
    );

    return ab2str(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

/**
 * Interface for MQTT broker information
 */
export interface BrokerInfo {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

/**
 * Store MQTT broker information with encryption for sensitive fields
 * @param brokerInfo - The broker configuration to store
 * @param masterPassword - Password used for encryption
 */
export const saveBrokerInfo = async (
  brokerInfo: BrokerInfo,
  masterPassword: string
): Promise<void> => {
  // Only encrypt sensitive fields
  const sensitiveData = JSON.stringify({
    username: brokerInfo.username || '',
    password: brokerInfo.password || ''
  });

  // Encrypt the sensitive data
  const encryptedData = await encryptData(sensitiveData, masterPassword);

  // Store in localStorage
  localStorage.setItem('brokerInfoSensitive', encryptedData);

  // Store non-sensitive data separately (unencrypted for easier access)
  localStorage.setItem('brokerInfoBasic', JSON.stringify({
    host: brokerInfo.host,
    port: brokerInfo.port
  }));
};

/**
 * Retrieve stored MQTT broker information
 * @param masterPassword - Password used for decryption
 * @returns BrokerInfo object or null if not found or decryption fails
 */
export const getBrokerInfo = async (
  masterPassword: string
): Promise<BrokerInfo | null> => {
  try {
    // Get basic info
    const basicData = localStorage.getItem('brokerInfoBasic');
    if (!basicData) return null;

    const { host, port } = JSON.parse(basicData);

    // Get and decrypt sensitive info
    const encryptedData = localStorage.getItem('brokerInfoSensitive');
    if (!encryptedData) {
      return { host, port };
    }

    const decrypted = await decryptData(encryptedData, masterPassword);
    const { username, password } = JSON.parse(decrypted);

    return {
      host,
      port,
      username,
      password
    };
  } catch (error) {
    console.error("Error retrieving broker info:", error);
    return null;
  }
};
