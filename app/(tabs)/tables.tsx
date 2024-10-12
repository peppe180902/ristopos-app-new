import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { getTables } from '@/services/api';

type Table = {
  id: number;
  status: 'free' | 'occupied';
  total: number;
};

export default function TablesScreen() {
  const [tables, setTables] = useState<Table[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const fetchedTables = await getTables();
      setTables(fetchedTables);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTables().then(() => setRefreshing(false));
  }, []);

  const renderTableItem = ({ item }: { item: Table }) => (
    <View style={[styles.tableItem, item.status === 'occupied' ? styles.occupiedTable : styles.freeTable]}>
      <Text style={styles.tableId}>Tavolo #{item.id}</Text>
      <Text style={styles.tableStatus}>{item.status === 'occupied' ? 'Occupato' : 'Libero'}</Text>
      {item.status === 'occupied' && <Text style={styles.tableTotal}>Totale: €{item.total.toFixed(2)}</Text>}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Dettagli</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={tables}
      renderItem={renderTableItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
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
    padding: 10,
  },
  tableItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  freeTable: {
    backgroundColor: '#e6ffe6',
  },
  occupiedTable: {
    backgroundColor: '#ffe6e6',
  },
  tableId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tableStatus: {
    fontSize: 16,
    marginVertical: 5,
  },
  tableTotal: {
    fontSize: 16,
    fontWeight: 'bold',
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