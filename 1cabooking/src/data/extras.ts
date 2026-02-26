import type { T } from './services';

export interface DryerLocation {
  id: string;
  label: T;
  price: number;
}

export interface Extra {
  id: string;
  name: T;
  description: T;
  originalPrice: number;
  bundlePrice: number;
  bundlePricePrefix?: T; // e.g. "Start" for dryer vent
  hasQuantity: boolean;
  image?: string;
  dryerLocations?: DryerLocation[];
}

export const EXTENDED_COVERAGE = 8.59;
export const TPS_RATE = 0.05;       // 5% federal tax
export const TVQ_RATE = 0.09975;    // 9.975% Quebec provincial tax

export const EXTRAS: Extra[] = [
  {
    id: 'extra-uvc',
    name: { en: 'UV-C Light Kit & Installation', fr: 'Kit lumière UV-C et installation' },
    description: {
      en: 'UV-C Sanitization Kit Standard cleaning removes dust; our UV-C Sanitization Kit kills what you can\'t see. This medical-grade system continuously sterilizes your air and prevents mold growth, keeping your home smelling fresh and "Certified Clean" 24/7. Includes professional installation and the Duct Masters warranty.',
      fr: 'Le nettoyage standard élimine la poussière; notre kit UV-C tue ce que vous ne voyez pas. Ce système médical stérilise en continu votre air et prévient les moisissures, gardant votre maison fraîche et "certifiée propre" 24h/24.',
    },
    originalPrice: 475,
    bundlePrice: 350,
    hasQuantity: false,
    image: '/images/uvc.jpg',
  },
  {
    id: 'extra-wall-unit',
    name: { en: 'Wall Unit (Mini-Split)', fr: 'Unité murale (Mini-Split)' },
    description: {
      en: 'Eliminate hidden mold and restore peak efficiency. This specialized deep cleaning service uses foaming antimicrobial agents to sanitize the coil and remove biological buildup from the internal scroll fan.',
      fr: 'Éliminez les moisissures cachées et restaurez l\'efficacité maximale. Ce service utilise des agents antimicrobiens moussants pour assainir la bobine et éliminer les dépôts biologiques.',
    },
    originalPrice: 250,
    bundlePrice: 200,
    hasQuantity: true,
    image: '/images/wall-unit.jpg',
  },
  {
    id: 'extra-air-exchanger',
    name: { en: 'Air Exchanger Cleaning', fr: 'Nettoyage échangeur d\'air' },
    description: {
      en: 'Standalone cleaning for HRV/ERV units and dedicated ducts. Ideal for homes with electric heating.',
      fr: 'Nettoyage autonome pour les unités VRC/VRE et les conduits dédiés. Idéal pour les maisons avec chauffage électrique.',
    },
    originalPrice: 350,
    bundlePrice: 150,
    hasQuantity: true,
    image: '/images/air-exchanger.jpg',
  },
  {
    id: 'extra-outdoor-heat-pump',
    name: { en: 'Outdoor Heat Pump & Condenser Cleaning', fr: 'Nettoyage pompe à chaleur extérieure et condenseur' },
    description: {
      en: 'We deep-clean the exterior heat pump fins to remove dirt, pollen, and debris that block heat transfer. Since this unit is responsible for releasing or absorbing heat for your entire home, keeping these coils clear is essential for maximizing energy efficiency and preventing system strain.',
      fr: 'Nous nettoyons en profondeur les ailettes de la pompe à chaleur extérieure pour éliminer la saleté, le pollen et les débris qui bloquent le transfert de chaleur.',
    },
    originalPrice: 250,
    bundlePrice: 100,
    hasQuantity: true,
    image: '/images/outdoor-heat-pump.jpg',
  },
  {
    id: 'extra-furnace-blower',
    name: { en: 'Furnace / Air Handling Unit (Blower & Motor Cleaning)', fr: 'Fournaise / Unité de traitement d\'air (nettoyage soufflante et moteur)' },
    description: {
      en: 'We use a dual Brush & Air Wash method to strip away settled dust and allergens from the blower and motor housing. By removing these contaminants at the source, we ensure they aren\'t recirculated into your home, providing you with the cleanest air possible.',
      fr: 'Nous utilisons une méthode double brosse et lavage à l\'air pour éliminer la poussière et les allergènes du logement de la soufflante et du moteur.',
    },
    originalPrice: 250,
    bundlePrice: 100,
    hasQuantity: true,
    image: '/images/furnace-blower.jpg',
  },
  {
    id: 'extra-indoor-coil',
    name: { en: 'Indoor Unit Coil (Internal System Cleaning)', fr: 'Bobine unité intérieure (nettoyage système interne)' },
    description: {
      en: 'We clean this internal "radiator" because it acts as a primary dust trap for your entire home. Since all heated and cooled air must pass through these fins, removing the buildup at the source is essential for maintaining superior air quality and unrestricted airflow.',
      fr: 'Nous nettoyons ce "radiateur" interne car il agit comme un piège à poussière principal pour toute votre maison.',
    },
    originalPrice: 250,
    bundlePrice: 100,
    hasQuantity: true,
    image: '/images/indoor-coil.jpg',
  },
  {
    id: 'extra-dryer-vent',
    name: { en: 'Dryer Vent Cleaning', fr: 'Nettoyage conduit sèche-linge' },
    description: {
      en: 'Complete Fire Safety: We clean the entire vent line exclusively from the exterior using specialized, non-abrasive technology. This process reaches the dryer wall to safely eliminate hidden lint hazards.',
      fr: 'Sécurité incendie complète: Nous nettoyons toute la conduite depuis l\'extérieur avec une technologie spécialisée non abrasive pour éliminer les risques de peluches cachées.',
    },
    originalPrice: 200,
    bundlePrice: 50,
    bundlePricePrefix: { en: 'Start', fr: 'À partir' },
    hasQuantity: false,
    image: '/images/dryer-vent.jpg',
    dryerLocations: [
      { id: 'ground',       label: { en: 'Ground level (No ladder)',                    fr: 'Niveau du sol (sans échelle)'            }, price: 50  },
      { id: 'under-deck',   label: { en: "Under Deck (3' min clearance)",               fr: "Sous la terrasse (3' min)"               }, price: 100 },
      { id: 'small-ladder', label: { en: 'Small Ladder (14 foot)',                      fr: 'Petite échelle (14 pieds)'               }, price: 100 },
      { id: 'big-ladder',   label: { en: 'Big Ladder (22 foot)',                        fr: 'Grande échelle (22 pieds)'               }, price: 150 },
      { id: 'rooftop',      label: { en: 'Rooftop / Difficult Access (Access Provided)',fr: 'Toit / Accès difficile (accès fourni)'   }, price: 175 },
    ],
  },
  {
    id: 'extra-room-scan',
    name: { en: 'Extra Room Air Scan', fr: 'Analyse d\'air pièce supplémentaire' },
    description: {
      en: 'Expand your air quality report to other bedrooms or living areas. This add-on provides a laser-based analysis of dust, allergens, and chemical vapors for a specific room. We evaluate airflow and freshness, providing an individual air quality score to ensure every corner of your home is revitalized.',
      fr: 'Étendez votre rapport de qualité d\'air à d\'autres pièces. Ce supplément fournit une analyse laser de la poussière, des allergènes et des vapeurs chimiques pour une pièce spécifique.',
    },
    originalPrice: 100,
    bundlePrice: 35,
    hasQuantity: true,
    image: '/images/room-scan.jpg',
  },
  {
    id: 'extra-bathroom-fan',
    name: { en: 'Bathroom Exhaust Fan Cleaning', fr: 'Nettoyage ventilateur salle de bain' },
    description: {
      en: 'Restores proper airflow to prevent mold and moisture buildup. We use compressed air and brushing to clean the fan assembly and housing for quiet, efficient operation.',
      fr: 'Restaure une circulation d\'air adéquate pour prévenir les moisissures et l\'humidité. Nous utilisons de l\'air comprimé et des brosses pour nettoyer l\'ensemble du ventilateur.',
    },
    originalPrice: 200,
    bundlePrice: 25,
    hasQuantity: true,
    image: '/images/bathroom-fan.jpg',
  },
];
