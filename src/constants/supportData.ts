export interface SupportSection {
  id: string;
  name: string;
  desc: string;
  subsections: {
    id: string;
    name: string;
    desc: string;
    items: {
      label: string;
      desc?: string;
      ids: string[];
    }[];
  }[];
}

export const PILOT_DATA: SupportSection[] = [
  {
    id: 'starfighter-pilots',
    name: 'Starfighter Pilots',
    desc: 'The skilled aviators who dominate the stars. From the heroic Rebel X-wing pilots to the cold, efficient TIE fighter corps, this archive tracks the evolution of flight gear and life-support systems across every era of the Star Wars saga. For collectors, these figures are essential support units, representing the brave and often overlooked heroes and villains who fought in the most intense space battles. Their detailed flight suits, intricate helmet designs, and the inclusion of specialized gear like oxygen masks and life-support chests make them highly sought after. Building a collection of these pilots allows you to recreate the most iconic dogfights and space-based missions in the Star Wars galaxy, adding a sense of speed and action to your display.',
    subsections: [
      {
        id: 'rebel-pilots',
        name: 'Rebel & Resistance Pilots',
        desc: 'The brave men and women of the Alliance and Resistance. Known for their iconic orange flight suits and specialized helmets, these pilots are the masters of the X-wing, Y-wing, and A-wing starfighters.',
        items: [
          { 
            label: 'Luke Skywalker - Classic (1999-2004)', 
            desc: 'The original LEGO Luke Skywalker in his X-wing pilot gear, a staple of the early LEGO Star Wars sets.',
            ids: ['sw0019', 'sw0019a'] 
          },
          { 
            label: 'Luke Skywalker - Modern (2018-2023)', 
            desc: 'Highly detailed modern versions featuring dual-molded legs and intricate helmet printing.',
            ids: ['sw0952', 'sw1267'] 
          },
          { label: 'X-wing Pilots (Red Squadron)', ids: ['sw0399', 'sw0544', 'sw1281', 'sw1359'] },
          { label: 'Y-wing Pilots (Gold Leader & Others)', ids: ['sw0033', 'sw0033a', 'sw0094', 'sw0369', 'sw0801', 'sw0932', 'sw1279'] },
          { label: 'A-wing Pilots', ids: ['sw0031', 'sw0031a', 'sw0031b', 'sw0437', 'sw0743', 'sw0757', 'sw0819', 'sw1092'] },
          { label: 'B-wing Pilots', ids: ['sw0032', 'sw0032a', 'sw0455'] },
          { label: 'U-wing & Specialized Pilots', ids: ['sw0761', 'sw0793', 'sw0800', 'sw1134', '85863pb076'] }
        ]
      },
      {
        id: 'imperial-pilots',
        name: 'Imperial TIE Pilots',
        desc: 'The elite starfighter corps of the Galactic Empire. Encased in specialized black flight suits with life-support chests, these pilots are trained for high-speed, high-stakes combat in the galaxy\'s most expendable yet deadly craft.',
        items: [
          { label: 'Classic TIE Pilots (2001-2006)', ids: ['sw0035', 'sw0035a', 'sw0035b'] },
          { label: 'Mid-Era TIE Pilots (2010-2014)', ids: ['sw0268', 'sw0268a', 'sw0457', 'sw0543'] },
          { label: 'Modern TIE Pilots (2015-2025)', ids: ['sw0621', 'sw0632', 'sw0926', 'sw1138', 'sw1260', 'sw1331', 'sw1484'] },
          { label: 'Specialized (Striker & First Order)', ids: ['sw0672', 'sw0788'] }
        ]
      },
      {
        id: 'clone-pilots',
        name: 'Clone Pilots',
        desc: 'The Republic\'s specialized aviation units. This section chronicles the evolution from the Phase 1 open-helmet designs of the Clone Wars to the more advanced, fully enclosed Phase 2 systems used in the Republic\'s final days.',
        items: [
          { label: 'Phase 1 Clone Pilots', ids: ['sw0118', 'sw0191', 'sw0281', 'sw0355', 'sw0491', 'sw0609', 'sw1425'] },
          { label: 'Phase 2 Clone Pilots', ids: ['sw0266', 'sw0439', 'sw0608', 'sw1402'] },
          { label: 'Phase 2 Named Pilots (Jag, Odd Ball)', ids: ['sw0265', 'sw1399', 'sw1401'] }
        ]
      }
    ]
  }
];

export const TECH_OFFICER_DATA: SupportSection[] = [
  {
    id: 'tech-officers',
    name: 'Tech & Officers',
    desc: 'The strategic and logistical backbone of the galaxy\'s military machines. This archive includes the high-ranking officers who command fleets, the specialized drivers who operate massive walkers, and the technical staff who keep the gears of war turning. For collectors, these figures are essential support units, representing the administrative and technical expertise that kept the Republic, the Empire, and the First Order functioning. Their distinct uniforms, from the olive-drab of the Empire to the specialized gear of the walker drivers, are captured in stunning detail by LEGO. Building a collection of these support personnel allows you to recreate the command centers, hangars, and walker cockpits that were the true engines of the galaxy\'s conflicts.',
    subsections: [
      {
        id: 'imperial-officers',
        name: 'Imperial Officers',
        desc: 'The rigid hierarchy of the Galactic Empire. From the olive-drab uniforms of the standard officers to the high-ranking Grand Admirals and Moffs, these figures represent the Empire\'s absolute control over the galaxy.',
        items: [
          { label: 'Generals, Admirals & Named Officers', ids: ['sw0114', 'sw0261', 'sw0877', 'sw1154'] },
          { label: 'Standard Officers (2014-2025)', ids: ['sw0582', 'sw0623', 'sw0775', 'sw1043', 'sw1142'] },
          { label: 'Standard Officers (2002-2012)', ids: ['sw0046', 'sw0154', 'sw0293', 'sw0376', 'sw0426'] },
          { label: 'Imperial Shuttle Pilots (Officer Uniform)', ids: ['sw0802', 'sw1480'] }
        ]
      },
      {
        id: 'vehicle-drivers',
        name: 'Vehicle Drivers',
        desc: 'The specialized operators of the Empire\'s ground-based terror. This section focuses on the AT-AT and AT-ST drivers, featuring their unique helmets and life-support gear designed for the cockpits of the galaxy\'s most fearsome walkers.',
        items: [
          { label: 'AT-AT Drivers (Classic & Red Logo)', ids: ['sw0102', 'sw0177', 'sw0262'] },
          { label: 'AT-AT Drivers (Modern & Dark Red Logo)', ids: ['sw0581', 'sw1104', 'sw1105', 'sw1176'] },
          { label: 'AT-ST Drivers', ids: ['sw0797', 'sw1183', 'sw1217', 'sw1420'] }
        ]
      },
      {
        id: 'rebel-crew',
        name: 'Rebel Crew & Gunners',
        desc: 'The essential support staff of the Rebel Alliance. These technicians and gunners are responsible for maintaining the fleet and operating the heavy weaponry that allows the Rebellion to strike back against the Empire.',
        items: [
          { label: 'Rebel Crew (Modern)', ids: ['sw1286'] },
          { label: 'Rebel Technicians (Classic)', ids: ['sw0034', 'sw0082'] }
        ]
      }
    ]
  }
];

export const DROID_DATA: SupportSection[] = [
  {
    id: 'droids',
    name: 'Droids',
    desc: 'The mechanical heart of the Star Wars universe. This comprehensive archive tracks the evolution of the galaxy\'s most essential droids, from the versatile R2-series astromechs to the sophisticated protocol units like C-3PO. For collectors, these figures are the ultimate support units, representing the diverse and often indispensable mechanical helpers that served the Jedi, the Rebellion, the Empire, and everyone in between. Their unique designs, from the iconic dome heads of the astromechs to the human-like frames of the protocol droids, are captured in incredible detail. Building a collection of these droids allows you to recreate the most memorable scenes in the saga, adding a sense of life and personality to your display.',
    subsections: [
      {
        id: 'astromechs',
        name: 'Astromech Droids',
        desc: 'The ultimate utility units. These droids are essential for starship repair, navigation, and hyperspace calculations. This section categorizes them by their color schemes, printing variants, and specialized equipment.',
        items: [
          { 
            label: 'R2-D2 - Classic & Standard (1999-2013)', 
            desc: 'The classic astromech design that remained largely unchanged for over a decade.',
            ids: ['sw0028', 'sw0217', 'sw0255', 'sw0512'] 
          },
          { 
            label: 'R2-D2 - Modern Standard (2014-2024)', 
            desc: 'Updated with more accurate printing and a slightly different head mold for better detail.',
            ids: ['sw0527', 'sw0527a', 'sw1085', 'sw1202'] 
          },
          { label: 'R2-D2 - Serving Tray Variants', ids: ['sw0028a', 'sw0217a', 'sw1385'] },
          { label: 'R2-D2 - Dirt Stained Variants', ids: ['sw0908', 'sw1200'] },
          { label: 'R2-D2 - Holiday & Seasonal', ids: ['sw0424', 'sw0679', 'sw1241'] },
          { label: 'R2 Series (Other)', ids: ['sw0155', 'sw0168', 'sw0213', 'sw0303', 'sw0555', 'sw0572', 'sw0648', 'sw0933', 'sw0943', 'sw1261', 'sw1280', 'sw1291'] },
          { label: 'R3 Series', ids: ['sw0393', 'sw0724', 'sw0773', 'sw0809', 'sw0825', 'sw0895', 'sw1466'] },
          { label: 'R4 Series', ids: ['sw0267', 'sw0456', 'sw0477', 'sw0534', 'sw0706', 'sw1221', 'sw1400'] },
          { label: 'R5 Series', ids: ['sw0029', 'sw0142', 'sw0370', 'sw0373', 'sw0375', 'sw0937', 'sw1403'] },
          { label: 'R7, R8 & Specialized', ids: ['sw0119', 'sw0231', 'sw0313', 'sw1110', 'sw1397'] },
          { label: 'Unique Models (Chopper, R1, etc.)', ids: ['sw0147', 'sw0390', 'sw0565', 'sw0589', 'sw1013', 'sw1052', 'sw1308', 'sw1362', 'sw1393'] }
        ]
      },
      {
        id: 'protocol',
        name: 'Protocol Droids',
        desc: 'Specialized in etiquette and translation, these droids are vital for diplomatic relations across millions of cultures. This archive highlights the various iterations of C-3PO and other protocol models used throughout the galaxy.',
        items: [
          { label: 'C-3PO - Classic & Chrome (2000-2007)', ids: ['sw0010', 'sw0158', 'sw0161', 'sw0161a'] },
          { label: 'C-3PO - Detailed Printing & Molded Legs', ids: ['sw0365', 'sw0561', 'sw0700', 'sw1201', 'sw1209', 'sw1440'] },
          { label: 'C-3PO - Specialized (Red Arm, Bounty Hunter)', ids: ['sw0653', 'sw1368'] },
          { label: 'C-3PO - Holiday & Seasonal', ids: ['sw0680', 'sw1238'] },
          { label: 'RA-7 Series (Death Star/Imperial)', ids: ['sw0212', 'sw0573', 'sw0938', 'sw1473'] },
          { label: 'TC Series (Diplomatic)', ids: ['sw0385', 'sw0546'] },
          { label: 'Other Named Protocol Droids', ids: ['sw0344', 'sw0766', 'sw1136'] }
        ]
      },
      {
        id: 'other-droids',
        name: 'Other Droids',
        desc: 'A collection of specialized utility units, including the essential Gonk power droids and medical units that provide critical support in the field.',
        items: [
          { label: 'Gonk & Medical Droids', ids: ['sw0430', 'sw0373'] }
        ]
      }
    ]
  }
];
