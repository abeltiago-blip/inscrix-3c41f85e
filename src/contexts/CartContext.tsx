import React, { createContext, useContext, useEffect, useState } from 'react';

interface ParticipantData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  documentNumber: string;
  nif?: string;
  nationality: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions: string;
  tshirtSize: string;
  teamId?: string;
  teamName?: string;
}

interface CartItem {
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
  eventDate: string;
  eventLocation: string;
  participantData?: ParticipantData;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  addParticipantItem: (item: Omit<CartItem, 'quantity'>, participantData: ParticipantData) => void;
  editItem: (index: number, item: Omit<CartItem, 'quantity'>, participantData: ParticipantData) => void;
  removeItem: (eventId: string, ticketTypeId: string, index?: number) => void;
  updateQuantity: (eventId: string, ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedItems = localStorage.getItem('inscrix-cart');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem('inscrix-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        item => item.eventId === newItem.eventId && item.ticketTypeId === newItem.ticketTypeId && !item.participantData
      );

      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...current, { ...newItem, quantity: 1 }];
      }
    });
  };

  const addParticipantItem = (newItem: Omit<CartItem, 'quantity'>, participantData: ParticipantData) => {
    setItems(current => {
      // Each participant gets their own cart item, no quantity grouping
      return [...current, { ...newItem, quantity: 1, participantData }];
    });
  };

  const editItem = (index: number, newItem: Omit<CartItem, 'quantity'>, participantData: ParticipantData) => {
    setItems(current => {
      const updated = [...current];
      updated[index] = { ...newItem, quantity: 1, participantData };
      return updated;
    });
  };

  const removeItem = (eventId: string, ticketTypeId: string, index?: number) => {
    setItems(current => {
      if (index !== undefined) {
        // Remove specific item by index (for participant-specific items)
        return current.filter((_, i) => i !== index);
      } else {
        // Remove all items with matching eventId and ticketTypeId (for quantity-based items)
        return current.filter(item => !(item.eventId === eventId && item.ticketTypeId === ticketTypeId));
      }
    });
  };

  const updateQuantity = (eventId: string, ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(eventId, ticketTypeId);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.eventId === eventId && item.ticketTypeId === ticketTypeId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    addItem,
    addParticipantItem,
    editItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};