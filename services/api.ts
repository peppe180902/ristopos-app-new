import { API_URL, CONSUMER_KEY, CONSUMER_SECRET } from '@/config';
import axios from 'axios';

const apiPost = axios.create({
  baseURL: 'https://spa.giuseppenapoli.com/wp-json/wp/v2',
});

// Fetch all posts
export const getPosts = async () => {
  try {
    const response = await apiPost.get('/posts');
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

//axios config
const api = axios.create({
  baseURL: API_URL,
  auth: {
    username: CONSUMER_KEY,
    password: CONSUMER_SECRET
  },
  withCredentials: true,
});

export interface Product {
  id: number;
  name: string;
  price: string;
  images: { src: string }[];
}

// Fetch all pages of data from a paginated API endpoint
async function fetchAllPages(endpoint: string, params: any = {}) {
  let page = 1;
  let allData: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const response = await api.get(endpoint, {
      params: {
        ...params,
        per_page: 100,
        page: page
      }
    });

    allData = [...allData, ...response.data];

    if (response.data.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return allData;
}

// Fetch all active orders
export const getOrders = async () => {
  try {
    console.log('Fetching all active orders...');
    const orders = await fetchAllPages('/wc/v3/orders');
    console.log('All active orders fetched successfully:', orders.length);
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

//api libera senza auth
export const getTables = async () => {
  try {
    const response = await axios.get('https://spa.giuseppenapoli.com/wp-json/ristopos/v1/tables');
    
    const tablesArray = Object.entries(response.data).map(([id, table]) => ({
      id: parseInt(id),
      ...(table as any)
    }));
    
    return tablesArray;
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};




// Fetch all products
export const getProducts = async () => {
  try {
    console.log('Fetching all products...');
    const products = await fetchAllPages('/wc/v3/products');
    console.log('All products fetched successfully:', products.length);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

async function getNonce() {
  try {
    // Modifica l'endpoint per il nonce
    const response = await api.get('/wp-json/ristopos/v1/nonce');
    return response.data.nonce;
  } catch (error) {
    console.error('Error getting nonce:', error);
    throw error;
  }
}


interface Order {
  product_id: number;
  quantity: number;
}


/* export const createOrder = async (orderItems: Order[], tableId: number): Promise<any> => {
  try {
    const orderData = {
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      set_paid: true,
      status: "completed",
      line_items: orderItems,
      meta_data: [
        {
          key: "table_id",
          value: tableId.toString()
        }
      ]
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    const response = await api.post('/wc/v3/orders', orderData);
    console.log('Order created successfully. Response:', JSON.stringify(response.data, null, 2));

    // Verifica che il table_id sia presente nella risposta
    const returnedTableId = response.data.meta_data.find((meta: any) => meta.key === 'table_id')?.value;
    console.log('Returned table ID:', returnedTableId);

    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};
 */

export const createOrder = async (orderItems: Order[], tableId: number): Promise<any> => {
  try {
    const orderData = {
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      set_paid: true,
      status: "completed",
      line_items: orderItems,
      meta_data: [
        {
          key: "table_id",
          value: tableId.toString()
        },
        {
          key: "_created_via",
          value: "RistoPOS"
        }
      ]
    };

    console.log('Creating order with data:', orderData);

    const response = await api.post('/wc/v3/orders', orderData);
    console.log('Order created successfully:', response.data);

    // Aggiungi una chiamata per aggiornare esplicitamente il tavolo
    await updateTableAfterOrder(tableId, response.data.id, 21);

    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

const updateTableAfterOrder = async (tableId: number, orderId: number, order_total: number) => {
  try {
    const response = await api.post('/ristopos/v1/update-table', {
      table_id: tableId,
      order_id: orderId,
      order_total: order_total
    });
    console.log('Table updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating table:', error);
  }
};

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  notes?: string;
}
export default api;

