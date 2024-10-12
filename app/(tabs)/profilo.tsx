import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData, logout } from '@/services/auth';
import { useRouter } from 'expo-router';
import CustomButton from '@/components/CustomButton';

interface User {
    id: number;
    name: string;
    email: string;
    slug: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const data = await getUserData();
    if (data) {
      setUserData(data);
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    console.log('loading', loading)
    try {
      await logout();
      console.log('Logout completato, reindirizzamento...');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1000)
    } catch (error) {
      console.error('Errore durante il logout:', error);
      Alert.alert('Errore', 'Non è stato possibile effettuare il logout. Riprova.');
    } finally {
      setLoading(false)
    }
  };

  const handleclick = () => {
    setLoading(true)
    console.log('loading', loading)
    setTimeout(() => {
      setLoading(false)
    }, 5000)
  }

  if (!userData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-gray-600">Caricamento...</Text>
        {/* <Button title="Logout" onPress={handleLogout} /> */}
        <CustomButton title={'Esci'} isLoading={loading} handlePress={handleLogout} containerStyles={'bg-red-500'} textStyles='text-white' />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        <View className="m-4 bg-white rounded-xl shadow-md overflow-hidden">
          <View className="p-8">
            <Text className="text-2xl font-bold text-gray-800 mb-4">Profilo Utente</Text>
            <View className="space-y-2">
              <Text className="text-gray-600">Nome: <Text className="font-semibold text-gray-800">{userData.name}</Text></Text>
              <Text className="text-gray-600">Email: <Text className="font-semibold text-gray-800">{userData.email || 'Non disponibile'}</Text></Text>
              <Text className="text-gray-600">Username: <Text className="font-semibold text-gray-800">{userData.slug}</Text></Text>
              <Text className="text-gray-600">ID: <Text className="font-semibold text-gray-800">{userData.id}</Text></Text>
            </View>
          </View>
          <CustomButton title={'Esci'} isLoading={loading} handlePress={handleLogout} containerStyles={'bg-red-500'} textStyles='text-white' />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}