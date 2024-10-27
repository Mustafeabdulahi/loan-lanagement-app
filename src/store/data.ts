import { create } from 'zustand';
import { Customer, Transaction } from '../types';

// Initialize data from localStorage or use defaults
const getInitialCustomers = (): Customer[] => {
  const stored = localStorage.getItem('customers');
  return stored ? JSON.parse(stored) : [];
};

const getInitialTransactions = (): Transaction[] => {
  const stored = localStorage.getItem('transactions');
  return stored ? JSON.parse(stored) : [];
};

interface DataState {
  customers: Customer[];
  transactions: Transaction[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalLoaned' | 'totalPaid' | 'currentBalance' | 'createdAt'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerTransactions: (customerId: string) => Transaction[];
}

export const useDataStore = create<DataState>((set, get) => ({
  customers: getInitialCustomers(),
  transactions: getInitialTransactions(),

  addCustomer: (customerData) => {
    set((state) => {
      const newCustomer: Customer = {
        id: crypto.randomUUID(),
        ...customerData,
        totalLoaned: 0,
        totalPaid: 0,
        currentBalance: 0,
        createdAt: new Date().toISOString(),
      };
      
      const updatedCustomers = [...state.customers, newCustomer];
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      
      return { customers: updatedCustomers };
    });
  },

  addTransaction: (transactionData) => {
    set((state) => {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        ...transactionData,
      };

      // Update customer balances
      const updatedCustomers = state.customers.map(customer => {
        if (customer.id === transactionData.customerId) {
          const amount = transactionData.amount;
          if (transactionData.type === 'loan') {
            return {
              ...customer,
              totalLoaned: customer.totalLoaned + amount,
              currentBalance: customer.currentBalance + amount,
            };
          } else {
            return {
              ...customer,
              totalPaid: customer.totalPaid + amount,
              currentBalance: customer.currentBalance - amount,
            };
          }
        }
        return customer;
      });

      const updatedTransactions = [...state.transactions, newTransaction];
      
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      return {
        customers: updatedCustomers,
        transactions: updatedTransactions,
      };
    });
  },

  getCustomerById: (id) => {
    return get().customers.find(c => c.id === id);
  },

  getCustomerTransactions: (customerId) => {
    return get().transactions.filter(t => t.customerId === customerId);
  },
}));