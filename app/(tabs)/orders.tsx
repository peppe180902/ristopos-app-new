import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { getOrders } from '@/services/api';

type Order = {
  id: number;
  status: string;
  total: string;
  line_items: Array<{ name: string; quantity: number }>;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders().then(() => setRefreshing(false));
  }, []);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderId}>Ordine #{item.id}</Text>
      <Text style={styles.orderStatus}>Stato: {item.status}</Text>
      <Text style={styles.orderTotal}>Totale: €{item.total}</Text>
      <Text style={styles.orderItemsTitle}>Articoli:</Text>
      {item.line_items.map((lineItem, index) => (
        <Text key={index} style={styles.orderItemDetail}>
          {lineItem.quantity}x {lineItem.name}
        </Text>
      ))}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Gestisci Ordine</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={orders}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  orderItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 16,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  orderItemDetail: {
    fontSize: 14,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#0073aa',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});