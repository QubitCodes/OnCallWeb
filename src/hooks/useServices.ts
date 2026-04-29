import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { Service } from '@/types/service';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use native axios to hit the local Next.js API route instead of the Adonis base URL
        const response = await require('axios').default.get('/api/v1/public/services');
        const servicesData = response.data.data || response.data || [];
        
        // Ensure we have valid service objects
        const validServices = servicesData.filter((service: Partial<Service>) => 
          service && service.id && service.name && service.slug
        );
        
        setServices(validServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
        // Set empty array, let components handle fallbacks
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Helper functions
  const getActiveServices = () => services.filter(service => service.active);
  
  const getServicesByCategory = (category: 'home-care' | 'specialist-care') => 
    getActiveServices().filter(service => service.category === category);
  
  const getHomeCareServices = () => 
    getActiveServices().filter(service => 
      service.category === 'home-care' || !service.category
    );
  
  const getSpecialistCareServices = () => getServicesByCategory('specialist-care');

  return {
    services,
    loading,
    error,
    getActiveServices,
    getServicesByCategory,
    getHomeCareServices,
    getSpecialistCareServices,
  };
};
