import { createOrder } from '@/services/api';
import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';

const OrderTest: React.FC = () => {
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        payment_method: "bacs",
        payment_method_title: "Direct Bank Transfer",
        set_paid: true,
        billing: {
          first_name: "John",
          last_name: "Doe",
          address_1: "969 Market",
          address_2: "",
          city: "San Francisco",
          state: "CA",
          postcode: "94103",
          country: "US",
          email: "john.doe@example.com",
          phone: "(555) 555-5555"
        },
        line_items: [
          {
            product_id: 93,
            quantity: 2
          }
        ]
      };

      const response = await createOrder(orderData);
      setOrderStatus(`Order created successfully. Order ID: ${response.id}`);
    } catch (error) {
      setOrderStatus('Failed to create order');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Button color={'white'} title="Create Test Order" onPress={handleCreateOrder} />
      {orderStatus && <Text style={styles.status}>{orderStatus}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#cb2525',
  },
  status: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
  },
});

export default OrderTest;