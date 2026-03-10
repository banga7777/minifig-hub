export interface EliteSection {
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

export const MANDALORIAN_DATA: EliteSection[] = [
  {
    id: 'mandalorians',
    name: 'Mandalorians',
    desc: 'The legendary warrior culture of Mandalore, known for their nearly indestructible Beskar armor and mastery of combat. This archive covers the complete lineage from the traditional clans and bounty hunters like Boba Fett to the specialized splinter groups like Death Watch. For collectors, these figures are the ultimate elite specialists, representing the diverse and often conflicting ideologies of the Mandalorian people. The intricate details on their helmets, the variety of their armor colors, and the inclusion of specialized weapons like jetpacks and flamethrowers make them highly sought after. Building a Mandalorian collection allows you to explore the rich history and culture of one of the most fascinating warrior societies in the Star Wars galaxy.',
    subsections: [
      {
        id: 'the-tribe',
        name: 'The Tribe & Bounty Hunters',
        desc: 'Focusing on the core figures of the Mandalorian creed. This includes the journey of Din Djarin from his early durasteel days to his full Beskar transformation, the legendary legacy of the Fett family, and the secretive Armorer who guides the covert.',
        items: [
          { 
            label: 'Din Djarin - Brown Durasteel Armor', 
            desc: 'The initial look of the Mandalorian as seen in the first episodes of the series, featuring a mix of salvaged armor plates.',
            ids: ['sw1057', 'sw1242'] 
          },
          { 
            label: 'Din Djarin - Silver Beskar Armor', 
            desc: 'The iconic full Beskar suit forged by the Armorer, representing Din\'s rise as a true warrior of the Creed.',
            ids: ['sw1135', 'sw1166', 'sw1212', 'sw1258', 'sw1488'] 
          },
          { 
            label: 'The Armorer & Paz Vizsla', 
            desc: 'The spiritual leader of the Tribe and the heavy-infantry warrior who values strength and tradition above all.',
            ids: ['sw1171', 'sw1172', 'sw1341'] 
          },
          { label: 'Tribe Warriors', ids: ['sw1077', 'sw1078', 'sw1079', 'sw1080'] }
        ]
      },
      {
        id: 'death-watch',
        name: 'Death Watch & Super Commandos',
        desc: 'The ideological splinter groups that sought to return Mandalore to its ancient warrior roots. This section chronicles the rise of Pre Vizsla\'s Death Watch, the Maul-led Super Commandos, and the modern resistance led by Bo-Katan Kryze and Sabine Wren.',
        items: [
          { label: 'Death Watch Warriors', ids: ['sw0296'] },
          { label: 'Mandalorian Loyalists', ids: ['sw1096'] },
          { label: 'Maul Loyalists', ids: ['sw0494', 'sw0495', 'sw1486', 'sw1487'] },
          { label: 'Gar Saxon & Bo-Katan', ids: ['sw1162', 'sw1163', 'sw1287'] },
          { label: 'Sabine Wren - Rebels Era', ids: ['sw0616', 'sw0742'] },
          { label: 'Sabine Wren - Ahsoka Series Era', ids: ['sw1302', 'sw1395'] }
        ]
      }
    ]
  }
];

export const ELITE_CLONE_DATA: EliteSection[] = [
  {
    id: 'elite-clones',
    name: 'Elite Clone Units',
    desc: 'The most highly trained and specialized soldiers of the Grand Army of the Republic. These units were often granted more autonomy and specialized gear to handle high-stakes missions that standard infantry could not accomplish. For collectors, these figures are essential elite specialists, representing the pinnacle of clone trooper training and equipment. The unique armor modifications, specialized weapons, and the inclusion of detailed gear like kamas and pauldrons make them stand out in any display. Building a collection of these elite units allows you to recreate the most daring and critical missions of the Clone Wars, showcasing the tactical versatility of the Republic\'s finest soldiers.',
    subsections: [
      {
        id: 'arc-troopers',
        name: 'ARC Troopers',
        desc: 'Advanced Recon Commandos (ARC) were the elite of the elite. Hand-picked for their independent thinking and superior combat skills, these troopers often served as battlefield commanders and specialized operatives.',
        items: [
          { 
            label: 'ARC Trooper Fives', 
            desc: 'CT-5555, a hero of the Clone Wars who discovered the secret of the inhibitor chips.',
            ids: ['sw1329'] 
          },
          { 
            label: 'ARC Trooper Echo', 
            desc: 'A tactical genius who survived the Citadel and later joined the Bad Batch.',
            ids: ['sw1151'] 
          },
          { label: 'ARC Trooper Hammer', ids: ['sw0377'] },
          { label: 'BARC Troopers', ids: ['sw0524'] }
        ]
      },
      {
        id: 'bad-batch',
        name: 'Clone Force 99',
        desc: 'Formally known as Experimental Unit Clone Force 99, the "Bad Batch" consists of clones with desirable genetic mutations. Each member possesses a unique "super-soldier" skill, making them an unorthodox but incredibly effective team.',
        items: [
          { label: 'Hunter, Wrecker & Tech', ids: ['sw1148', 'sw1149', 'sw1150'] },
          { label: 'ARC Trooper Echo (Bad Batch)', ids: ['sw1151'] },
          { label: 'Gonky (GNK Power Droid)', ids: ['sw1153'] }
        ]
      },
      {
        id: 'clone-commandos',
        name: 'Clone Commandos',
        desc: 'Specialized four-man squads trained for covert operations, sabotage, and high-value target acquisition. These commandos were equipped with the iconic Katarn-class armor and specialized weaponry.',
        items: [
          { label: 'Commander Crosshair (Imperial Elite Squad)', ids: ['sw1152'] },
          { label: 'Republic Commandos', ids: ['sw1264'] }
        ]
      }
    ]
  }
];

export const IMPERIAL_GUARD_DATA: EliteSection[] = [
  {
    id: 'imperial-guards',
    name: 'Imperial Guards',
    desc: 'The absolute pinnacle of loyalty and combat prowess within the Empire and the First Order. These silent sentinels are hand-picked from the most promising recruits to serve as the personal protectors of the galaxy\'s most powerful leaders. For collectors, these figures are the ultimate elite specialists, representing the most loyal and dangerous guardians of the Imperial and First Order regimes. Their striking armor designs, from the classic crimson of the Royal Guards to the sleek, high-tech look of the Praetorian Guards, make them highly desirable. Building a collection of these elite guards allows you to recreate the most secure and imposing locations in the galaxy, adding a sense of danger and authority to your display.',
    subsections: [
      {
        id: 'royal-guards',
        name: 'Royal Guards',
        desc: 'The iconic crimson-clad protectors of Emperor Palpatine. Trained in the deadly art of Echani combat and absolute obedience, their presence alone is enough to instill terror in the Emperor\'s enemies.',
        items: [
          { label: 'Imperial Royal Guards - Classic (2001-2006)', ids: ['sw0040', 'sw0040b'] },
          { label: 'Imperial Royal Guards - Modern (2014-2025)', ids: ['sw0521', 'sw0521b', 'sw1478'] }
        ]
      },
      {
        id: 'praetorian-guards',
        name: 'Praetorian Guards',
        desc: 'The elite personal guard of Supreme Leader Snoke and later the Imperial Remnant. Equipped with high-tech melee weapons and specialized armor capable of deflecting blaster bolts and even lightsaber strikes.',
        items: [
          { label: 'Imperial Praetorian Guards', ids: ['sw1343'] },
          { label: 'Elite Praetorian Guards', ids: ['sw0947', 'sw0989', 'sw0990'] }
        ]
      },
      {
        id: 'other-guards',
        name: 'Senate & Shadow Guards',
        desc: 'This section covers the blue-clad Senate Commandos who protected the Republic\'s political heart, and the mysterious Shadow Guards—Force-sensitive operatives used by the Empire for clandestine missions.',
        items: [
          { label: 'Senate Commandos', ids: ['sw0244', 'sw0244a', 'sw0614'] },
          { label: 'Senate Commando Captains', ids: ['sw0288', 'sw0613'] },
          { label: 'Shadow Guards', ids: ['sw0604'] }
        ]
      }
    ]
  }
];
