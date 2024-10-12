import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://spa.giuseppenapoli.com/wp-json/wp/v2/users/me';

export async function login(username: string, password: string) {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(username + ':' + password),
      },
    });

    console.log('Stato della risposta:', response.status);
    const userData = await response.json();
    console.log('Corpo della risposta:', userData);

      if (userData && userData.id) {
        // Genera un token semplice (in produzione, dovresti usare un metodo più sicuro)
        const token = btoa(username + ':' + password);
        
        // Salva il token
        await AsyncStorage.setItem('userToken', token);
        console.log('token login', token)
        
        // Salva lo stato di autenticazione
        await AsyncStorage.setItem('isAuthenticated', 'true');
        
        // Salva i dati dell'utente
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('Login riuscito. Token salvato:', token);
        return { success: true, user: userData, token: token };
    }

    throw new Error('Autenticazione fallita');
  } catch (error: any) {
    console.error('Errore durante il login:', error);
    return { success: false, error: error.message };
  }
}

export async function isAuthenticated() {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch (error) {
    console.error('Errore nel controllo dell autenticazione:', error);
    return false;
  }
}

export async function getToken() {
  return await AsyncStorage.getItem('userToken');
}

export async function logout() {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('isAuthenticated');
    await AsyncStorage.removeItem('userData');
    console.log('Logout effettuato con successo');
    return true;
  } catch (error) {
    console.error('Errore durante il logout:', error);
    return false;
  }
}

export async function getUserData() {
  const userData = await AsyncStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

export async function getCredentials() {
  const username = await AsyncStorage.getItem('username');
  const password = await AsyncStorage.getItem('password');
  console.log('Credenziali recuperate:', { username, password });
  return { username, password };
}

