import React, { useState } from 'react';
import { View, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import FormField from '../Input';
import CustomButton from '../CustomButton';
import { login } from '@/services/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        console.log('Login riuscito, token:', result.token);
        // Qui puoi navigare alla schermata principale dell'app
        router.replace('/(tabs)');
      } else {
        Alert.alert('Errore di login', result.error || 'Impossibile accedere. Riprova.');
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante il login. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className='h-full pt-40 bg-[#5e3a3a]'>
      <Image
        source={require('@/assets/images/logo-ristopos-white.png')}
        className='w-[300px] h-[100px] self-center mb-[20px]'
      />
      <FormField title={''} value={username} placeholder={'Username'} handleChangeText={setUsername} otherStyles={''} />
      <FormField title={'Password'} value={password} placeholder={'Password'} handleChangeText={setPassword} otherStyles={''} />

      <CustomButton title={'Accedi'} isLoading={isLoading} handlePress={handleLogin} containerStyles={'bg-orange-500 mt-10 mx-5'} textStyles='text-white' />
    </View>
  );
}
