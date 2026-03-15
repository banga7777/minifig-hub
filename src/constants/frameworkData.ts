export interface FrameworkCategory {
  id: string;
  title: string;
  icon: string;
  summary: string;
  clusters: { name: string; details: string }[];
  color: string;
  link: string;
}

export const FRAMEWORK_CATEGORIES: FrameworkCategory[] = [
  {
    id: 'army-builders',
    title: 'Army Builders',
    icon: '👥',
    summary: 'Mass-produced infantry groups for large-scale displays and legion building.',
    clusters: [
      { name: 'Clone Troopers', details: 'Phase 1 (Classic/New), Phase 2 (501st, 212th, 104th, 41st, 187th, 332nd, Coruscant Guard).' },
      { name: 'Stormtroopers', details: 'Classic armor evolution, Dual-mold helmet types, Snow/Sand/Shore/Mud/Scout Trooper variants.' },
      { name: 'Droid Army', details: 'B1 Battle Droids (Standard/Pilot/Security/Commander), B2 Super Battle Droids, Droidekas, and Commando Droids.' }
    ],
    color: 'from-indigo-600 to-blue-700',
    link: '/lego-star-wars-minifigure-archive/army-builders'
  },
  {
    id: 'character-centerpieces',
    title: 'Character Centerpieces',
    icon: '⭐',
    summary: 'Iconic protagonists and named characters that form the core of any collection.',
    clusters: [
      { name: 'Skywalker Saga', details: 'Anakin Skywalker (by era), Luke Skywalker (by outfit/lightsaber), Darth Vader (by printing/helmet mold).' },
      { name: 'Jedi Council', details: 'Obi-Wan Kenobi, Master Yoda, Mace Windu, Qui-Gon Jinn, Ahsoka Tano (Padawan/Fulcrum/White).' },
      { name: 'Sith & Dark Side', details: 'Emperor Palpatine, Darth Maul, Count Dooku, Inquisitorius (Grand Inquisitor and Brothers).' }
    ],
    color: 'from-amber-500 to-orange-600',
    link: '/lego-star-wars-minifigure-archive/character-centerpieces'
  },
  {
    id: 'elite-specialists',
    title: 'Elite Specialists',
    icon: '🛡️',
    summary: 'Elite tactical units and special agents with unique armor and equipment.',
    clusters: [
      { name: 'Mandalorians', details: 'Din Djarin (Beskar), Boba Fett (Classic/Re-armored), Bo-Katan, Death Watch, Super Commando Legions.' },
      { name: 'Elite Clone Units', details: 'ARC Troopers (Fives/Echo), Bad Batch (Clone Force 99), Clone Commandos (Gregor/Scorch).' },
      { name: 'Imperial Guards', details: 'Royal Guard, Praetorian Guard, Shadow Guard, Senate Guard, and specialized escort units.' }
    ],
    color: 'from-emerald-600 to-teal-700',
    link: '/lego-star-wars-minifigure-archive/elite-specialists'
  },
  {
    id: 'support-units',
    title: 'Support Units',
    icon: '🔧',
    summary: 'Pilots, technical support, and auxiliary personnel of the galaxy.',
    clusters: [
      { name: 'Starfighter Pilots', details: 'Rebel/Resistance Pilots, Imperial TIE Pilots, Clone Pilots (P1/P2/Open Helmet variants).' },
      { name: 'Tech & Officers', details: 'AT-AT/AT-ST Drivers, Imperial Officers (General/Admiral), Rebel Crew, Death Star Gunners.' },
      { name: 'Droids', details: 'R2-D2 & Astromech series (by color/printing), C-3PO (by leg mold), Protocol and Gonk Droids.' }
    ],
    color: 'from-sky-500 to-indigo-600',
    link: '/lego-star-wars-minifigure-archive/support-units'
  }
];
