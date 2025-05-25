
import React from 'react';
import { Car } from 'lucide-react';

interface CarLogoProps {
  make: string;
  model?: string;
  className?: string;
  fallbackClassName?: string;
}

const CarLogo: React.FC<CarLogoProps> = ({ 
  make, 
  model, 
  className = "w-10 h-10", 
  fallbackClassName = "w-10 h-10 text-gray-400" 
}) => {
  // Map of car makes to their logo URLs (using reliable CDN sources)
  const logoMap: Record<string, string> = {
    toyota: 'https://cdn.freebiesupply.com/logos/large/2x/toyota-2-logo-png-transparent.png',
    honda: 'https://cdn.freebiesupply.com/logos/large/2x/honda-6-logo-png-transparent.png',
    ford: 'https://cdn.freebiesupply.com/logos/large/2x/ford-6-logo-png-transparent.png',
    chevrolet: 'https://cdn.freebiesupply.com/logos/large/2x/chevrolet-2-logo-png-transparent.png',
    bmw: 'https://cdn.freebiesupply.com/logos/large/2x/bmw-logo-png-transparent.png',
    mercedes: 'https://cdn.freebiesupply.com/logos/large/2x/mercedes-benz-6-logo-png-transparent.png',
    audi: 'https://cdn.freebiesupply.com/logos/large/2x/audi-3-logo-png-transparent.png',
    volkswagen: 'https://cdn.freebiesupply.com/logos/large/2x/volkswagen-4-logo-png-transparent.png',
    nissan: 'https://cdn.freebiesupply.com/logos/large/2x/nissan-6-logo-png-transparent.png',
    hyundai: 'https://cdn.freebiesupply.com/logos/large/2x/hyundai-motor-company-logo-png-transparent.png',
    kia: 'https://cdn.freebiesupply.com/logos/large/2x/kia-logo-png-transparent.png',
    mazda: 'https://cdn.freebiesupply.com/logos/large/2x/mazda-6-logo-png-transparent.png',
    subaru: 'https://cdn.freebiesupply.com/logos/large/2x/subaru-logo-png-transparent.png',
    lexus: 'https://cdn.freebiesupply.com/logos/large/2x/lexus-2-logo-png-transparent.png',
    acura: 'https://cdn.freebiesupply.com/logos/large/2x/acura-logo-png-transparent.png',
    infiniti: 'https://cdn.freebiesupply.com/logos/large/2x/infiniti-3-logo-png-transparent.png',
    cadillac: 'https://cdn.freebiesupply.com/logos/large/2x/cadillac-logo-png-transparent.png',
    lincoln: 'https://cdn.freebiesupply.com/logos/large/2x/lincoln-motor-company-logo-png-transparent.png',
    volvo: 'https://cdn.freebiesupply.com/logos/large/2x/volvo-logo-png-transparent.png',
    tesla: 'https://cdn.freebiesupply.com/logos/large/2x/tesla-9-logo-png-transparent.png'
  };

  const normalizedMake = make.toLowerCase().trim();
  const logoUrl = logoMap[normalizedMake];

  if (!logoUrl) {
    return <Car className={fallbackClassName} />;
  }

  return (
    <img
      src={logoUrl}
      alt={`${make} logo`}
      className={className}
      onError={(e) => {
        // If logo fails to load, replace with fallback icon
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        
        // Create and insert fallback icon
        const fallback = document.createElement('div');
        fallback.innerHTML = '<svg class="' + fallbackClassName + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m6 10V7m-6 0a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>';
        target.parentNode?.insertBefore(fallback.firstChild!, target.nextSibling);
      }}
    />
  );
};

export default CarLogo;
