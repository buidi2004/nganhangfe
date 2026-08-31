import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const CREDENTIALS_KEY = 'SenBank_Secure_Credentials';

export interface SavedCredentials {
  phone: string;
  password?: string;
  refreshToken?: string;
}

/**
 * Check if the device has biometric hardware and is enrolled.
 */
export const checkBiometricSupport = async (): Promise<boolean> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  } catch (e) {
    console.warn('Error checking biometric support', e);
    return false;
  }
};

/**
 * Save credentials securely (e.g., after a successful manual login).
 */
export const saveCredentials = async (credentials: SavedCredentials): Promise<boolean> => {
  try {
    const data = JSON.stringify(credentials);
    await SecureStore.setItemAsync(CREDENTIALS_KEY, data, {
      requireAuthentication: false, // Don't require auth just to save
    });
    return true;
  } catch (e) {
    console.error('Error saving credentials', e);
    return false;
  }
};

/**
 * Read credentials securely, prompting for biometric authentication.
 */
export const getCredentials = async (promptMessage: string = 'Xác thực bằng Vân tay/FaceID'): Promise<SavedCredentials | null> => {
  try {
    const hasHardware = await checkBiometricSupport();
    if (!hasHardware) return null;

    // Prompt user for biometrics
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Hủy',
      disableDeviceFallback: true,
    });

    if (result.success) {
      // If success, get the data from SecureStore
      const data = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (data) {
        return JSON.parse(data) as SavedCredentials;
      }
    }
    return null;
  } catch (e) {
    console.error('Error getting credentials', e);
    return null;
  }
};

/**
 * Clear saved credentials (e.g., on logout).
 */
export const clearCredentials = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  } catch (e) {
    console.error('Error clearing credentials', e);
  }
};

/**
 * Check if there is any saved data (without prompting biometrics)
 * Useful for showing/hiding the biometric button.
 */
export const hasSavedCredentials = async (): Promise<boolean> => {
  try {
    const data = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    return !!data;
  } catch (e) {
    return false;
  }
};
