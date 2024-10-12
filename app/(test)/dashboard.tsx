import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Button, StatusBar } from 'react-native';
import { getOrders, getTables, getProducts } from '@/services/api';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const [orderCount, setOrderCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [occupiedTables, setOccupiedTables] = useState(0);
  const [dailySales, setDailySales] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [orders, tables] = await Promise.all([getOrders(), getTables()]);

      setOrderCount(orders.length);
      setTableCount(tables.length);
      setOccupiedTables(tables.filter((table: { status: string; }) => table.status === 'occupied').length);

      const today = new Date().toISOString().split('T')[0];
      const todaySales = orders
        .filter(order => order.date_created.startsWith(today))
        .reduce((sum, order) => sum + parseFloat(order.total), 0);
      setDailySales(todaySales);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().then(() => setRefreshing(false));
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard RistoPOS</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orderCount}</Text>
          <Text style={styles.statLabel}>Ordini Attivi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{occupiedTables}/{tableCount}</Text>
          <Text style={styles.statLabel}>Tavoli Occupati</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>€{dailySales.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Vendite Oggi</Text>
        </View>
        <Button title='Clicca' onPress={() => {
          router.push('/login');
        }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});