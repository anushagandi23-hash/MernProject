import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../config/api';
import { Bus, BusDetails, SeatInfo, BusContextType } from '../types';

const BusContext = createContext<BusContextType | undefined>(undefined);

interface BusProviderProps {
  children: ReactNode;
}

export const BusProvider: React.FC<BusProviderProps> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusDetails | null>(null);
  const [seatInfo, setSeatInfo] = useState<SeatInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuses = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/buses');
      if (response.data.success) {
        setBuses(response.data.data);
        setFilteredBuses(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch buses');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  const searchBuses = async (from: string, to: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/buses/search', {
        params: { from, to }
      });
      if (response.data.success) {
        setFilteredBuses(response.data.data);
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getBusDetails = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/buses/${id}`);
      if (response.data.success) {
        setSelectedBus(response.data.data);
        setSeatInfo({
          totalSeats: response.data.data.totalSeats,
          availableCount: response.data.data.availableSeats.length,
          bookedCount: response.data.data.bookedSeats.length,
          reservedCount: response.data.data.reservedSeats?.length || 0,
          availableSeats: response.data.data.availableSeats,
          bookedSeats: response.data.data.bookedSeats,
          reservedSeats: response.data.data.reservedSeats || [],
          occupancyPercentage: response.data.data.occupancyPercentage
        });
      } else {
        setError(response.data.error || 'Failed to fetch bus details');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch bus details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BusContext.Provider
      value={{
        buses,
        filteredBuses,
        selectedBus,
        seatInfo,
        loading,
        error,
        fetchBuses,
        searchBuses,
        getBusDetails
      }}
    >
      {children}
    </BusContext.Provider>
  );
};

export const useBus = (): BusContextType => {
  const context = useContext(BusContext);
  if (context === undefined) {
    throw new Error('useBus must be used within BusProvider');
  }
  return context;
};
