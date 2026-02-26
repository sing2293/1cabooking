export type Lang = 'en' | 'fr';
export type T = Record<Lang, string>;

export interface ScanBanner {
  text: T;
  color: 'purple' | 'green' | 'navy';
}

export interface DryerLocation {
  id: string;
  label: T;
  price: number;
}

export interface ServicePackage {
  id: string;
  name: T;
  price: number;
  priceLabel?: T;       // e.g. "STARTING AT"
  priceNote?: T;        // e.g. "+ VENTS"
  badge?: { text: T; color: 'purple' | 'green' };
  description: T;
  includes: T[];
  scanBanner?: ScanBanner;
  hasVentCount?: boolean;
  unitLabel?: T;        // "furnaces" | "units"
  dryerLocations?: DryerLocation[];
  image?: string;
}

export interface ServiceCategory {
  id: string;
  name: T;
  description: T;
  icon: 'central-air' | 'wall-unit' | 'dryer' | 'air-exchanger' | 'specialty';
  mostPopular?: boolean;
  packages: ServicePackage[];
}

export const SERVICES: ServiceCategory[] = [
  {
    id: 'central-air',
    name: { en: 'Central Air System', fr: 'Système d\'air central' },
    description: { en: 'Furnace & Ducts. For homes with vents in every room.', fr: 'Fournaise et conduits. Pour maisons avec bouches dans chaque pièce.' },
    icon: 'central-air',
    mostPopular: true,
    packages: [
      {
        id: 'platinum',
        name: { en: 'Platinum Package', fr: 'Forfait Platine' },
        price: 630,
        priceNote: { en: '+ VENTS', fr: '+ BOUCHES' },
        badge: {
          text: { en: 'RECOMMENDED: 1993+', fr: 'RECOMMANDÉ: 1993+' },
          color: 'purple',
        },
        description: {
          en: 'The ultimate standard of care for complex, post-1993 homes. This package provides Total Air Management by combining the critical three-point circuit (Ducts, Blower, Coils) with essential deep cleaning of the Air Exchanger, Dryer Vent, and bathroom exhaust systems, ensuring maximum safety and cleanliness throughout the entire structure.',
          fr: 'La norme ultime pour les maisons complexes construites après 1993. Ce forfait offre une gestion totale de l\'air en combinant le circuit tripoint critique (conduits, soufflante, bobines) avec un nettoyage en profondeur de l\'échangeur d\'air, du sèche-linge et des ventilateurs de salle de bain.',
        },
        includes: [
          { en: 'Main Supply & Return Trunks', fr: 'Conduits principaux d\'alimentation et de retour' },
          { en: 'Supply & Return Vents ($5 ea)', fr: 'Bouches d\'alimentation et de retour (5$ ch)' },
          { en: 'Furnace Cabinet Clean & Check', fr: 'Nettoyage et vérification du cabinet de fournaise' },
          { en: 'Trained by ASCS & CADCT Certified Owner', fr: 'Propriétaire certifié ASCS & CADCT' },
          { en: '30-Day Satisfaction Guarantee', fr: 'Garantie de satisfaction 30 jours' },
          { en: 'Free Disinfection (Value $50)', fr: 'Désinfection gratuite (valeur 50$)' },
          { en: 'Blower + Motor Cleaning (Air/Brush method)', fr: 'Nettoyage soufflante + moteur (méthode air/brosse)' },
          { en: 'Furnace Coil Cleaning (Air/Brush method)', fr: 'Nettoyage bobines de fournaise (méthode air/brosse)' },
          { en: 'Air Exchanger Cleaning', fr: 'Nettoyage de l\'échangeur d\'air' },
          { en: 'Dryer Vent Cleaning (Ground-level access only)', fr: 'Nettoyage sèche-linge (accès au sol seulement)' },
          { en: 'Bathroom Exhaust Fans (2 included)', fr: 'Ventilateurs de salle de bain (2 inclus)' },
          { en: 'Upgraded Future Bonus: Save $55', fr: 'Bonus futur amélioré: Économisez 55$' },
          { en: 'Dust, Chemical & Air Quality Air Purity Scan ($200 Value) (1 Room)', fr: 'Analyse poussière, chimique & qualité d\'air ($200) (1 pièce)' },
        ],
        scanBanner: {
          text: { en: 'DUST LEVEL + CHEMICAL LEVEL + FRESH AIR LEVEL SCAN INCLUDED ($200 VALUE)', fr: 'ANALYSE POUSSIÈRE + NIVEAU CHIMIQUE + AIR FRAIS INCLUSE (VALEUR 200$)' },
          color: 'purple',
        },
        hasVentCount: true,
        unitLabel: { en: 'furnaces', fr: 'fournaises' },
        image: '/images/platinum.jpg',
      },
      {
        id: 'healthy-home',
        name: { en: 'Healthy Home Package', fr: 'Forfait Maison Saine' },
        price: 490,
        priceNote: { en: '+ VENTS', fr: '+ BOUCHES' },
        badge: {
          text: { en: 'RECOMMENDED: PRE-1993', fr: 'RECOMMANDÉ: AVANT 1993' },
          color: 'green',
        },
        description: {
          en: 'The highest standard of care for homes with central air. This package targets the critical three-point circuit—Ducts, Blower, and Coils—for maximum air flow and longevity, promoting a healthier living environment by significantly reducing airborne dust and allergens.',
          fr: 'La norme la plus élevée pour les maisons avec air central. Ce forfait cible le circuit tripoint critique — conduits, soufflante et bobines — pour un débit d\'air maximal, réduisant considérablement la poussière et les allergènes.',
        },
        includes: [
          { en: 'Main Supply & Return Trunks', fr: 'Conduits principaux d\'alimentation et de retour' },
          { en: 'Supply & Return Vents ($5 ea)', fr: 'Bouches d\'alimentation et de retour (5$ ch)' },
          { en: 'Furnace Cabinet Clean & Check', fr: 'Nettoyage et vérification du cabinet de fournaise' },
          { en: 'Trained by ASCS & CADCT Certified Owner', fr: 'Propriétaire certifié ASCS & CADCT' },
          { en: '30-Day Satisfaction Guarantee', fr: 'Garantie de satisfaction 30 jours' },
          { en: 'Free Disinfection (Value $50)', fr: 'Désinfection gratuite (valeur 50$)' },
          { en: 'Blower + Motor Cleaning (Air/Brush method)', fr: 'Nettoyage soufflante + moteur (méthode air/brosse)' },
          { en: 'Furnace Coil Cleaning (Air/Brush method)', fr: 'Nettoyage bobines de fournaise (méthode air/brosse)' },
          { en: 'Upgraded Future Bonus: Save $45', fr: 'Bonus futur amélioré: Économisez 45$' },
          { en: 'Dust, Chemical & Air Quality Air Purity Scan ($200 Value) (1 Room)', fr: 'Analyse poussière, chimique & qualité d\'air ($200) (1 pièce)' },
        ],
        scanBanner: {
          text: { en: 'DUST LEVEL + CHEMICAL LEVEL + FRESH AIR LEVEL SCAN INCLUDED ($200 VALUE)', fr: 'ANALYSE POUSSIÈRE + NIVEAU CHIMIQUE + AIR FRAIS INCLUSE (VALEUR 200$)' },
          color: 'green',
        },
        hasVentCount: true,
        unitLabel: { en: 'furnaces', fr: 'fournaises' },
        image: '/images/healthy-home.jpg',
      },
      {
        id: 'preferred',
        name: { en: 'Preferred Package', fr: 'Forfait Préféré' },
        price: 430,
        priceNote: { en: '+ VENTS', fr: '+ BOUCHES' },
        description: {
          en: 'The essential mechanical service. Includes comprehensive cleaning of the blower and motor for maximum efficiency and system longevity.',
          fr: 'Le service mécanique essentiel. Comprend un nettoyage complet de la soufflante et du moteur pour une efficacité maximale et une longévité du système.',
        },
        includes: [
          { en: 'Main Supply & Return Trunks', fr: 'Conduits principaux d\'alimentation et de retour' },
          { en: 'Supply & Return Vents ($5 ea)', fr: 'Bouches d\'alimentation et de retour (5$ ch)' },
          { en: 'Furnace Cabinet Clean & Check', fr: 'Nettoyage et vérification du cabinet de fournaise' },
          { en: 'Trained by ASCS & CADCT Certified Owner', fr: 'Propriétaire certifié ASCS & CADCT' },
          { en: '30-Day Satisfaction Guarantee', fr: 'Garantie de satisfaction 30 jours' },
          { en: 'Free Disinfection (Value $50)', fr: 'Désinfection gratuite (valeur 50$)' },
          { en: 'Blower + Motor Cleaning (Air/Brush method)', fr: 'Nettoyage soufflante + moteur (méthode air/brosse)' },
          { en: 'Upgraded Future Bonus: Save $35', fr: 'Bonus futur amélioré: Économisez 35$' },
          { en: 'Dust & Chemical Level Air Scan ($150 Value) (1 Room)', fr: 'Analyse poussière & niveau chimique (150$) (1 pièce)' },
        ],
        scanBanner: {
          text: { en: 'DUST LEVEL + CHEMICAL LEVEL SCAN INCLUDED ($150 VALUE)', fr: 'ANALYSE POUSSIÈRE + NIVEAU CHIMIQUE INCLUSE (VALEUR 150$)' },
          color: 'navy',
        },
        hasVentCount: true,
        unitLabel: { en: 'furnaces', fr: 'fournaises' },
        image: '/images/preferred.jpg',
      },
      {
        id: 'base',
        name: { en: 'Base Package', fr: 'Forfait de base' },
        price: 330,
        priceNote: { en: '+ VENTS', fr: '+ BOUCHES' },
        description: {
          en: 'The essential foundation for clean air. Focuses on removing built-up dust from the main ductwork arteries to improve airflow and general home hygiene.',
          fr: 'La base essentielle pour un air propre. Se concentre sur l\'élimination de la poussière accumulée dans les conduits principaux pour améliorer la circulation d\'air.',
        },
        includes: [
          { en: 'Main Supply & Return Trunks', fr: 'Conduits principaux d\'alimentation et de retour' },
          { en: 'Supply & Return Vents ($5 ea)', fr: 'Bouches d\'alimentation et de retour (5$ ch)' },
          { en: 'Furnace Cabinet Clean & Check', fr: 'Nettoyage et vérification du cabinet de fournaise' },
          { en: 'Trained by ASCS & CADCT Certified Owner', fr: 'Propriétaire certifié ASCS & CADCT' },
          { en: '30-Day Satisfaction Guarantee', fr: 'Garantie de satisfaction 30 jours' },
          { en: 'Free Disinfection (Value $50)', fr: 'Désinfection gratuite (valeur 50$)' },
          { en: 'Dust Level Air Scan ($100 Value) (1 Room)', fr: 'Analyse niveau de poussière (100$) (1 pièce)' },
          { en: 'Future Bonus: Save $25', fr: 'Bonus futur: Économisez 25$' },
        ],
        scanBanner: {
          text: { en: 'DUST LEVEL SCAN INCLUDED ($100 VALUE)', fr: 'ANALYSE NIVEAU POUSSIÈRE INCLUSE (VALEUR 100$)' },
          color: 'navy',
        },
        hasVentCount: true,
        unitLabel: { en: 'furnaces', fr: 'fournaises' },
        image: '/images/base.jpg',
      },
    ],
  },
  {
    id: 'wall-unit',
    name: { en: 'Wall Unit / Mini-Split', fr: 'Unité murale / Mini-split' },
    description: { en: 'Ductless systems mounted on walls.', fr: 'Systèmes sans conduits montés sur les murs.' },
    icon: 'wall-unit',
    packages: [
      {
        id: 'wall-unit-cleaning',
        name: { en: 'Wall Unit (Mini-Split)', fr: 'Unité murale (Mini-Split)' },
        price: 250,
        description: {
          en: 'Eliminate hidden mold and restore peak efficiency. This specialized deep cleaning service uses foaming antimicrobial agents to sanitize the coil and remove biological buildup from the internal scroll fan.',
          fr: 'Éliminez les moisissures cachées et restaurez l\'efficacité maximale. Ce service de nettoyage en profondeur utilise des agents antimicrobiens moussants pour assainir la bobine et éliminer les dépôts biologiques.',
        },
        includes: [
          { en: 'Full Non-Invasive Disassembly', fr: 'Démontage complet non invasif' },
          { en: 'Deep Coil Restoration (Non-Corrosive Wash)', fr: 'Restauration profonde de la bobine (lavage non corrosif)' },
          { en: 'Cabinet Casing, Fan, and Drain Pan Cleaned', fr: 'Boîtier, ventilateur et bac d\'égouttement nettoyés' },
          { en: 'Filter Disinfection', fr: 'Désinfection du filtre' },
          { en: 'Exterior Condenser Unit Cleaned', fr: 'Unité condensatrice extérieure nettoyée' },
          { en: 'Free Dust Scan (1 Room, Value $100)', fr: 'Analyse de poussière gratuite (1 pièce, valeur 100$)' },
        ],
        unitLabel: { en: 'units', fr: 'unités' },
        image: '/images/wall-unit.jpg',
      },
    ],
  },
  {
    id: 'dryer-vent',
    name: { en: 'Dryer Vent', fr: 'Conduit de sèche-linge' },
    description: { en: 'Prevent fire hazards & improve efficiency.', fr: 'Prévenez les risques d\'incendie et améliorez l\'efficacité.' },
    icon: 'dryer',
    packages: [
      {
        id: 'dryer-vent-cleaning',
        name: { en: 'Dryer Vent Cleaning', fr: 'Nettoyage conduit sèche-linge' },
        price: 200,
        priceLabel: { en: 'STARTING AT', fr: 'À PARTIR DE' },
        description: {
          en: 'Complete Fire Safety: We clean the entire vent line exclusively from the exterior using specialized, non-abrasive technology. This process reaches the dryer wall to safely eliminate hidden lint hazards.',
          fr: 'Sécurité incendie complète: Nous nettoyons toute la conduite de ventilation depuis l\'extérieur avec une technologie spécialisée et non abrasive. Ce processus atteint le mur du sèche-linge pour éliminer les risques de peluches cachées.',
        },
        includes: [
          { en: 'Entire Duct Line Cleaned (From exterior to dryer wall)', fr: 'Toute la conduite nettoyée (de l\'extérieur jusqu\'au mur)' },
          { en: 'Exterior Vent Cover Cleaning', fr: 'Nettoyage de la grille d\'aération extérieure' },
        ],
        dryerLocations: [
          { id: 'ground', label: { en: 'Ground level (No ladder)', fr: 'Niveau du sol (sans échelle)' }, price: 200 },
          { id: 'under-deck', label: { en: 'Under Deck (3\' min clearance)', fr: 'Sous terrasse (3\' min)' }, price: 250 },
          { id: 'small-ladder', label: { en: 'Small Ladder (14 foot)', fr: 'Petite échelle (14 pieds)' }, price: 250 },
          { id: 'big-ladder', label: { en: 'Big Ladder (22 foot)', fr: 'Grande échelle (22 pieds)' }, price: 300 },
          { id: 'rooftop', label: { en: 'Rooftop / Difficult Access (Access Provided)', fr: 'Toit / Accès difficile (accès fourni)' }, price: 350 },
          { id: 'inside-only', label: { en: 'Inside Only – No Exterior Access', fr: 'Intérieur seulement – Sans accès extérieur' }, price: 250 },
        ],
        image: '/images/dryer-vent.jpg',
      },
    ],
  },
  {
    id: 'air-exchanger',
    name: { en: 'Air Exchanger', fr: 'Échangeur d\'air' },
    description: { en: 'Fresh air intake systems (HRV/ERV).', fr: 'Systèmes d\'entrée d\'air frais (VRC/VRE).' },
    icon: 'air-exchanger',
    packages: [
      {
        id: 'air-exchanger-cleaning',
        name: { en: 'Air Exchanger Cleaning', fr: 'Nettoyage échangeur d\'air' },
        price: 350,
        priceNote: { en: '+ VENTS', fr: '+ BOUCHES' },
        description: {
          en: 'Standalone cleaning for HRV/ERV units and dedicated ducts. Ideal for homes with electric heating.',
          fr: 'Nettoyage autonome pour les unités VRC/VRE et les conduits dédiés. Idéal pour les maisons avec chauffage électrique.',
        },
        includes: [
          { en: 'Cleaning of HRV/ERV Cabinet', fr: 'Nettoyage du cabinet VRC/VRE' },
          { en: 'Disinfection of Cabinet interior', fr: 'Désinfection de l\'intérieur du cabinet' },
          { en: 'Cleaning of Motor(s) and Fan(s)', fr: 'Nettoyage du/des moteur(s) et ventilateur(s)' },
          { en: 'Duct Cleaning (Supply/Return) - $5/ea', fr: 'Nettoyage des conduits (alimentation/retour) - 5$/ch' },
          { en: 'Core and Filter cleaning (Air-dusting only)', fr: 'Nettoyage du noyau et du filtre (dépoussiérage seulement)' },
          { en: 'Free Dust Scan (1 Room, Value $100)', fr: 'Analyse de poussière gratuite (1 pièce, valeur 100$)' },
        ],
        scanBanner: {
          text: { en: 'DUST LEVEL SCAN INCLUDED ($100 VALUE)', fr: 'ANALYSE NIVEAU POUSSIÈRE INCLUSE (VALEUR 100$)' },
          color: 'navy',
        },
        hasVentCount: true,
        unitLabel: { en: 'units', fr: 'unités' },
        image: '/images/air-exchanger.jpg',
      },
    ],
  },
  {
    id: 'specialty',
    name: { en: 'Specialty', fr: 'Spécialité' },
    description: { en: 'Specific component cleaning.', fr: 'Nettoyage de composants spécifiques.' },
    icon: 'specialty',
    packages: [
      {
        id: 'uvc-light',
        name: { en: 'UV-C Light Kit & Installation', fr: 'Kit lumière UV-C et installation' },
        price: 475,
        description: {
          en: 'UV-C Sanitization Kit Standard cleaning removes dust; our UV-C Sanitization Kit kills what you can\'t see. This medical-grade system continuously sterilizes your air and prevents mold growth, keeping your home smelling fresh and "Certified Clean" 24/7. Includes professional installation and the Duct Masters warranty.',
          fr: 'Kit de désinfection UV-C. Le nettoyage standard élimine la poussière; notre kit UV-C tue ce que vous ne voyez pas. Ce système médical stérilise en continu votre air et prévient la croissance des moisissures.',
        },
        includes: [
          { en: '36W UV-C Sterilization: Neutralizes 99.9% of airborne viruses and bacteria', fr: 'Stérilisation UV-C 36W: neutralise 99,9% des virus et bactéries' },
          { en: 'Odor Elimination: Stops "Dirty Sock Syndrome" by preventing mold on wet AC coils', fr: 'Élimination des odeurs: stoppe le "syndrome de la chaussette sale"' },
          { en: 'Precision Install: Professionally drilled, mounted, and airtight-sealed', fr: 'Installation précise: percé, monté et scellé hermétiquement' },
          { en: 'Auto-Safety Sensors: Built-in shutoff for 100% safe operation', fr: 'Capteurs de sécurité automatiques: arrêt intégré pour une opération 100% sûre' },
          { en: 'System Status Light: LED indicator for easy 24/7 monitoring', fr: 'Voyant de statut: indicateur LED pour surveillance facile 24h/24' },
          { en: 'Duct Masters Guarantee: 90-day labor coverage + 1-year limited defect warranty', fr: 'Garantie Duct Masters: 90 jours main-d\'œuvre + 1 an pièces défectueuses' },
        ],
        unitLabel: { en: 'units', fr: 'unités' },
        image: '/images/uvc.jpg',
      },
      {
        id: 'furnace-blower',
        name: { en: 'Furnace / Air Handling Unit (Blower & Motor Cleaning)', fr: 'Fournaise / Unité de traitement d\'air (nettoyage soufflante et moteur)' },
        price: 250,
        description: {
          en: 'We use a dual Brush & Air Wash method to strip away settled dust and allergens from the blower and motor housing. By removing these contaminants at the source, we ensure they aren\'t recirculated into your home, providing you with the cleanest air possible.',
          fr: 'Nous utilisons une méthode double brosse et lavage à l\'air pour éliminer la poussière et les allergènes du logement de la soufflante et du moteur.',
        },
        includes: [
          { en: 'Blower Wheel Deep Cleaning', fr: 'Nettoyage en profondeur de la roue de soufflante' },
          { en: 'Motor Housing Air Wash', fr: 'Lavage à l\'air du logement du moteur' },
          { en: 'In-Place or Detailed Unit Extraction', fr: 'Extraction de l\'unité en place ou détaillée' },
        ],
        unitLabel: { en: 'units', fr: 'unités' },
        image: '/images/furnace-blower.jpg',
      },
      {
        id: 'indoor-coil',
        name: { en: 'Indoor Unit Coil (Internal System Cleaning)', fr: 'Bobine unité intérieure (nettoyage système interne)' },
        price: 250,
        description: {
          en: 'We clean this internal "radiator" because it acts as a primary dust trap for your entire home. Since all heated and cooled air must pass through these fins, removing the buildup at the source is essential for maintaining superior air quality and unrestricted airflow.',
          fr: 'Nous nettoyons ce "radiateur" interne car il agit comme un piège à poussière principal pour toute votre maison. Tout l\'air chauffé et refroidi passe par ces ailettes.',
        },
        includes: [
          { en: 'Coil Fin Cleaning', fr: 'Nettoyage des ailettes de la bobine' },
          { en: 'Airflow Path Restoration', fr: 'Restauration du chemin de flux d\'air' },
          { en: 'Safe Dry Process', fr: 'Processus sec sécuritaire' },
          { en: 'Source Removal', fr: 'Élimination à la source' },
        ],
        unitLabel: { en: 'units', fr: 'unités' },
        image: '/images/indoor-coil.jpg',
      },
      {
        id: 'outdoor-heat-pump',
        name: { en: 'Outdoor Heat Pump & Condenser Cleaning', fr: 'Nettoyage pompe à chaleur extérieure et condenseur' },
        price: 250,
        description: {
          en: 'We deep-clean the exterior heat pump fins to remove dirt, pollen, and debris that block heat transfer. Since this unit is responsible for releasing or absorbing heat for your entire home, keeping these coils clear is essential for maximizing energy efficiency and preventing system strain.',
          fr: 'Nous nettoyons en profondeur les ailettes de la pompe à chaleur extérieure pour éliminer la saleté, le pollen et les débris qui bloquent le transfert de chaleur.',
        },
        includes: [
          { en: 'Coil Fin Cleaning', fr: 'Nettoyage des ailettes de la bobine' },
          { en: 'Airflow Path Restoration', fr: 'Restauration du chemin de flux d\'air' },
          { en: 'Safe Wet & Dry Process', fr: 'Processus humide et sec sécuritaire' },
          { en: 'Source Removal', fr: 'Élimination à la source' },
        ],
        unitLabel: { en: 'units', fr: 'unités' },
        image: '/images/outdoor-heat-pump.jpg',
      },
    ],
  },
];
