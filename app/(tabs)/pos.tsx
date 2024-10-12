import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { createOrder, getProducts, getTables } from '@/services/api';

type Product = {
  id: number;
  name: string;
  price: string;
  images: Array<{ src: string }>;
};

type Table = {
  id: number;
  status: 'free' | 'occupied';
};

interface LineItem {
  product_id: number;
  quantity: number;
  // Aggiungi altri campi se necessario, come variazioni o note
}

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function POSScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProductsAndTables();
  }, []);

  const fetchProductsAndTables = async () => {
    try {
      const [fetchedProducts, fetchedTables] = await Promise.all([getProducts(), getTables()]);
      setProducts(fetchedProducts); 
      setTables(fetchedTables);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const completeOrder = async () => {
    if (!selectedTable || order.length === 0) {
      Alert.alert('Errore', 'Seleziona un tavolo e aggiungi prodotti al carrello prima di completare l\'ordine.');
      return;
    }
  
    
    try {

      const orderTotal = order.reduce((total, item) => {
        return total + (item.price * item.quantity); // Somma il prezzo per la quantità di ciascun articolo
      }, 0);

      // Mappa gli articoli dell'ordine nel formato corretto
      const orderItems = order.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: orderTotal
      }));
  
      // Calcola il totale dell'ordine
      // Chiama la funzione createOrder passando gli articoli e il totale dell'ordine
      const result = await createOrder(orderItems, selectedTable);
  
      // Mostra un messaggio di successo
      Alert.alert('Successo', `Ordine creato con successo! ID Ordine: ${result.id}. Totale: €${orderTotal.toFixed(2)}`);
  
      // Resetta lo stato dopo aver completato l'ordine
      setOrder([]);
      setSelectedTable(null);
      setIsCartVisible(false);
  
      // Aggiorna i tavoli per riflettere il nuovo stato
      fetchProductsAndTables();
    } catch (error) {
      console.error('Error completing order:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante la creazione dell\'ordine. Riprova.');
    }
  };
  

  const addToOrder = (product: Product) => {
    const existingItem = order.find(item => item.id === product.id);
    if (existingItem) {
      setOrder(order.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrder([...order, { ...product, quantity: 1, price: parseFloat(product.price) }]);
    }
  };

  const removeFromOrder = (productId: number) => {
    setOrder(order.filter(item => item.id !== productId));
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productItem} onPress={() => addToOrder(item)}>
      <Image
        source={{ uri: item.images[0]?.src || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>€{item.price}</Text>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderItemName}>{item.name}</Text>
      <View style={styles.orderItemDetails}>
        <Text>x{item.quantity}</Text>
        <Text>€{(item.price * item.quantity).toFixed(2)}</Text>
        <TouchableOpacity onPress={() => removeFromOrder(item.id)}>
          <FontAwesome5 name="trash-alt" size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalAmount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProductsAndTables().then(() => setRefreshing(false));
  }, []);


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.titleTable}>Scorri per selezionare un tavolo</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tablesContainer}>
        {tables.map(table => (
          <TouchableOpacity
            key={table.id}
            style={[
              styles.tableItem,
              selectedTable === table.id && styles.selectedTable,
              table.status === 'occupied' && styles.occupiedTable
            ]}
            onPress={() => setSelectedTable(table.id)}
          >
            <FontAwesome5
              name="table"
              size={24}
              color={table.status === 'occupied' ? '#e74c3c' : '#2ecc71'}
            />
            <Text style={styles.tableText}>Tavolo {table.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => setIsCartVisible(true)}
      >
        <FontAwesome5 name="shopping-cart" size={24} color="#fff" />
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{order.length}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCartVisible}
        onRequestClose={() => setIsCartVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCartVisible(false)}
            >
              <FontAwesome5 name="times" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Carrello</Text>
            <FlatList
              data={order}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.orderList}
            />
            <Text style={styles.totalAmount}>Totale: €{totalAmount.toFixed(2)}</Text>
            <TouchableOpacity
              style={[
                styles.completeOrderButton,
                (!selectedTable || order.length === 0) && styles.disabledButton
              ]}
              disabled={!selectedTable || order.length === 0}
              onPress={completeOrder}
            >
              <Text style={styles.buttonText}>Completa Ordine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tablesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleTable: {
    paddingLeft: 10,
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#fff',
  },
  tableItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  selectedTable: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  occupiedTable: {
    backgroundColor: '#fadbd8',
  },
  tableText: {
    marginTop: 5,
    fontSize: 12,
  },
  productList: {
    padding: 10,
  },
  productItem: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#2ecc71',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderList: {
    marginBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderItemName: {
    flex: 1,
    fontSize: 16,
  },
  orderItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    justifyContent: 'space-between',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  completeOrderButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});