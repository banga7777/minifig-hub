import { Minifigure } from '../../types';

export interface CharacterSubSection {
  id: string;
  name: string;
  desc?: string;
  items: {
    label: string;
    ids?: string[];
    nameFilter?: string[];
    excludeFilter?: string[];
  }[];
}

export interface CharacterSection {
  title: string;
  desc: string;
  subsections: CharacterSubSection[];
}

export const SKYWALKER_SAGA_DATA: CharacterSection[] = [
  {
    title: "1. The Skywalker Bloodline",
    desc: "The family that shaped the destiny of the galaxy. This collection covers the Skywalker lineage, from the humble beginnings of Anakin on Tatooine to the rise of the Empire and the eventual redemption of the family through Luke and Leia. These figures are essential for any collector, as they represent the central figures of the Star Wars saga. Their evolution across the different eras—from the Clone Wars to the Galactic Civil War and the rise of the First Order—is captured in meticulous detail by LEGO, making them the most important centerpieces for any Star Wars collection.",
    subsections: [
      {
        id: "anakin-skywalker",
        name: "Anakin Skywalker",
        desc: "The prophesied Chosen One. His minifigures span his entire life, from his youth on Tatooine to his fall to the dark side.",
        items: [
          { label: "Young Anakin (Episode I)", ids: ["sw1332", "sw1001", "sw0640", "sw0327", "sw0349", "sw0159", "sw0008", "sw0007"] },
          { label: "Padawan (Episode II)", ids: ["sw0488", "sw0099", "sw0100"] },
          { label: "Jedi Knight & Clone Wars", ids: ["sw1398", "sw1083", "sw1095", "sw0939", "sw0526", "sw0542", "sw0317", "sw0618", "sw0263", "sw0183", "sw0120", "sw0139", "sw0121"] },
          { label: "Fall to the Dark Side", ids: ["sw0829", "sw0361", "sw0419", "sw0283"] }
        ]
      },
      {
        id: "darth-vader",
        name: "Darth Vader",
        desc: "The iconic Sith Lord. His minifigures have evolved significantly over the years, from the classic 1999 mold to the modern two-piece helmet.",
        items: [
          { label: "Classic Era (1999-2014)", ids: ["sw0004", "sw0004a", "sw0138", "sw0117", "sw0123", "sw0214", "sw0386", "sw0180", "sw0209", "sw0277", "sw0232", "sw0586"] },
          { label: "Modern Era (2015+)", ids: ["sw0636", "sw0744", "sw0636b", "sw0834", "sw0981", "sw1106", "sw1112", "sw1141", "sw1228", "sw1249", "sw1273"] },
          { label: "Special Editions & Holiday", ids: ["sw0218", "85863pb080", "sw0464", "sw0599", "sw1029", "sw1121", "sw1239", "sw1483"] },
          { label: "Apprentice", ids: ["sw0181"] }
        ]
      },
      {
        id: "luke-skywalker",
        name: "Luke Skywalker",
        desc: "The hero of the Rebellion. His minifigures capture his journey from a farmboy to a Jedi Master.",
        items: [
          { label: "Tatooine Farmboy", ids: ["sw1453", "sw1198", "sw1086", "sw0778", "sw0551", "sw0566", "sw0432", "sw0335", "sw0273", "sw0176", "sw0021"] },
          { label: "Rebel Pilot", ids: ["sw1267", "sw1139", "sw0991", "sw1024", "sw0952", "sw0569", "sw0461", "sw0295", "sw0090a", "sw0090", "sw0019a", "sw0019"] },
          { label: "Hoth, Dagobah & Bespin", ids: ["sw1143", "sw0731", "sw0098", "sw0957", "sw0342", "sw1199", "sw0907", "sw0106", "sw0106a", "sw0971", "sw0103"] },
          { label: "Jedi Knight & Endor", ids: ["sw1476", "sw1370", "sw1262", "sw1312", "sw1266", "sw1191", "sw0880a", "sw0880", "sw0635", "sw0509", "sw0433", "sw0395", "sw0292", "sw0207", "sw0083", "sw0079", "sw0068", "sw0020", "sw0044", "sw0018"] },
          { label: "Other Variants (Old, Disguise, Special)", ids: ["sw1460", "sw1203", "sw0777", "sw0204", "sw1283", "sw0257a", "sw0257", "sw1039", "sw0887", "sw1382", "sw1365", "sw0999", "85863pb075"] }
        ]
      },
      {
        id: "leia-organa",
        name: "Leia Organa",
        desc: "Princess of Alderaan, leader of the Rebellion, and General of the Resistance.",
        items: [
          { label: "White Dress (A New Hope)", ids: ["sw1459", "sw0994", "sw1036", "sw0779", "sw0337", "sw0175a", "sw0175b", "sw0175", "sw0026"] },
          { label: "Hoth & Bespin", ids: ["sw0958", "sw0878", "sw0346", "sw0113a", "sw0113", "sw0972", "sw0104"] },
          { label: "Jabba's Palace", ids: ["sw1389", "sw0485", "sw0085a", "sw0085", "sw0070"] },
          { label: "Endor & Celebration", ids: ["sw1264", "sw1296", "sw1282", "sw0643", "sw0504", "sw0371", "sw0235"] },
          { label: "General Leia & Special Editions", ids: ["sw1011", "sw0718", "sw1348", "sw1381", "sw1022"] }
        ]
      },
      {
        id: "kylo-ren",
        name: "Kylo Ren / Ben Solo",
        desc: "The conflicted son of Han Solo and Leia Organa.",
        items: [
          { label: "Kylo Ren", nameFilter: ["Kylo Ren"] },
          { label: "Ben Solo", nameFilter: ["Ben Solo"] }
        ]
      },
      {
        id: "rey-skywalker",
        name: "Rey Skywalker",
        desc: "The scavenger from Jakku who took on the Skywalker mantle.",
        items: [
          { label: "Scavenger & Jedi Training", ids: ["sw0677", "sw0866", "sw0888", "sw1054"] },
          { label: "Visions & Holiday", ids: ["sw1364", "sw1317"] }
        ]
      }
    ]
  }
];

export const JEDI_COUNCIL_DATA: CharacterSection[] = [
  {
    title: "1. Masters of the Order",
    desc: "The wisest and most powerful Jedi Masters who led the Jedi Order during its final days. This section includes the key members of the Jedi High Council, whose decisions shaped the course of the Clone Wars and the fate of the Republic. For collectors, these figures are the ultimate centerpieces, representing the pinnacle of Jedi wisdom and power. The intricate printing on their robes, the unique head molds for different species, and the inclusion of their iconic lightsabers make them highly desirable. Building a collection of these Jedi Masters allows you to recreate the iconic scenes of the Jedi Council Chamber and honor the legacy of the Jedi Order.",
    subsections: [
      {
        id: "obi-wan-kenobi",
        name: "Obi-Wan Kenobi",
        desc: "A legendary Jedi Master who played a significant role in the fate of the galaxy.",
        items: [
          { label: "Padawan & Jedi Knight", ids: ["sw0812", "sw0592", "sw0329", "sw0234", "sw0173", "sw0162", "sw0152", "sw0055a", "sw0069", "sw0055", "sw0024"] },
          { label: "Jedi Master & Clone Wars", ids: ["sw1424", "sw1082", "sw0846", "sw0704", "sw0552", "sw0535", "sw0449", "sw0498", "sw0489", "sw0362", "sw0409", "sw0197", "sw0137", "sw0135"] },
          { label: "Old Ben & Exile", ids: ["sw1467", "sw1255", "sw1227", "sw1220", "sw1084", "sw1046", "sw1069", "sw0637a", "sw0637", "sw0274", "sw0206", "sw0336", "sw0174", "sw0023a", "sw0023", "sw0388", "sw1254"] }
        ]
      },
      {
        id: "master-yoda",
        name: "Master Yoda",
        desc: "The Grand Master of the Jedi Order, known for his wisdom and connection to the Force.",
        items: [
          { label: "Master Yoda", nameFilter: ["Yoda"] }
        ]
      },
      {
        id: "mace-windu",
        name: "Mace Windu",
        desc: "A revered Jedi Master and Champion of the Jedi Order, known for his purple lightsaber.",
        items: [
          { label: "Mace Windu", nameFilter: ["Mace Windu"] }
        ]
      },
      {
        id: "qui-gon-jinn",
        name: "Qui-Gon Jinn",
        desc: "A maverick Jedi Master who discovered Anakin Skywalker.",
        items: [
          { label: "Qui-Gon Jinn", nameFilter: ["Qui-Gon Jinn"] }
        ]
      },
      {
        id: "ahsoka-tano",
        name: "Ahsoka Tano",
        desc: "Anakin Skywalker's Padawan who forged her own path.",
        items: [
          { label: "Ahsoka Tano", nameFilter: ["Ahsoka Tano", "Ahsoka ("] }
        ]
      }
    ]
  },
  {
    title: "2. Jedi Council Members",
    desc: "The esteemed members of the Jedi High Council.",
    subsections: [
      {
        id: "plo-koon",
        name: "Plo Koon",
        desc: "A Kel Dor Jedi Master and skilled pilot.",
        items: [
          { label: "Plo Koon", nameFilter: ["Plo Koon"] }
        ]
      },
      {
        id: "kit-fisto",
        name: "Kit Fisto",
        desc: "A Nautolan Jedi Master known for his cheerful demeanor and combat skills.",
        items: [
          { label: "Kit Fisto", nameFilter: ["Kit Fisto"] }
        ]
      },
      {
        id: "ki-adi-mundi",
        name: "Ki-Adi-Mundi",
        desc: "A Cerean Jedi Master with a binary brain.",
        items: [
          { label: "Ki-Adi-Mundi", nameFilter: ["Ki-Adi-Mundi"] }
        ]
      },
      {
        id: "shaak-ti",
        name: "Shaak Ti",
        desc: "A Togruta Jedi Master who oversaw clone trooper training on Kamino.",
        items: [
          { label: "Shaak Ti", nameFilter: ["Shaak Ti"] }
        ]
      },
      {
        id: "luminara-unduli",
        name: "Luminara Unduli",
        desc: "A Mirialan Jedi Master known for her discipline.",
        items: [
          { label: "Luminara Unduli", nameFilter: ["Luminara Unduli"] }
        ]
      },
      {
        id: "saesee-tiin",
        name: "Saesee Tiin",
        desc: "An Iktotchi Jedi Master and exceptional starfighter pilot.",
        items: [
          { label: "Saesee Tiin", nameFilter: ["Saesee Tiin"] }
        ]
      },
      {
        id: "agen-kolar",
        name: "Agen Kolar",
        desc: "A Zabrak Jedi Master known for his swordsmanship.",
        items: [
          { label: "Agen Kolar", nameFilter: ["Agen Kolar"] }
        ]
      },
      {
        id: "eeth-koth",
        name: "Eeth Koth",
        desc: "A Zabrak Jedi Master and member of the Jedi High Council.",
        items: [
          { label: "Eeth Koth", nameFilter: ["Eeth Koth"] }
        ]
      },
      {
        id: "stass-allie",
        name: "Stass Allie",
        desc: "A Tholothian Jedi Master and healer.",
        items: [
          { label: "Stass Allie", nameFilter: ["Stass Allie"] }
        ]
      },
      {
        id: "coleman-trebor",
        name: "Coleman Trebor",
        desc: "A Vurk Jedi Master who participated in the Battle of Geonosis.",
        items: [
          { label: "Coleman Trebor", nameFilter: ["Coleman Trebor"] }
        ]
      },
      {
        id: "even-piell",
        name: "Even Piell",
        desc: "A Lannik Jedi Master known for his courage.",
        items: [
          { label: "Even Piell", nameFilter: ["Even Piell"] }
        ]
      }
    ]
  },
  {
    title: "3. Jedi Knights & Padawans",
    desc: "Other notable Jedi who served the Republic.",
    subsections: [
      {
        id: "aayla-secura",
        name: "Aayla Secura",
        desc: "A Twi'lek Jedi Knight and skilled warrior.",
        items: [
          { label: "Aayla Secura", nameFilter: ["Aayla Secura"] }
        ]
      },
      {
        id: "barriss-offee",
        name: "Barriss Offee",
        desc: "A Mirialan Jedi Padawan who trained under Luminara Unduli.",
        items: [
          { label: "Barriss Offee", nameFilter: ["Barriss Offee"] }
        ]
      },
      {
        id: "nahdar-vebb",
        name: "Nahdar Vebb",
        desc: "A Mon Calamari Jedi Knight.",
        items: [
          { label: "Nahdar Vebb", nameFilter: ["Nahdar Vebb"] }
        ]
      },
      {
        id: "quinlan-vos",
        name: "Quinlan Vos",
        desc: "A maverick Jedi Master with psychometric abilities.",
        items: [
          { label: "Quinlan Vos", nameFilter: ["Quinlan Vos"] }
        ]
      },
      {
        id: "jedi-consular-knight",
        name: "Generic Jedi",
        desc: "Various unnamed Jedi Knights, Consulars, and Padawans.",
        items: [
          { label: "Jedi Consulars & Knights", nameFilter: ["Jedi Consular", "Jedi Knight", "Jedi Master", "Jedi Padawan", "Jedi Bob", "Ithorian Jedi Master"], excludeFilter: ["Anakin", "Luke", "Obi-Wan"] }
        ]
      }
    ]
  }
];

export const SITH_DARK_SIDE_DATA: CharacterSection[] = [
  {
    title: "1. Lords of the Sith",
    desc: "The dark side users who sought to control the galaxy. This section includes the most powerful Sith Lords and dark side adepts, whose machinations brought down the Republic and established the Galactic Empire. These figures are essential centerpieces for any collection, representing the ultimate antagonists of the Star Wars saga. Their menacing designs, from the iconic black armor of Darth Vader to the intricate robes of Emperor Palpatine, are captured in stunning detail. Collectors value these figures for their role in the most dramatic and pivotal moments of the saga, making them a must-have for any display that focuses on the dark side of the Force.",
    subsections: [
      {
        id: "emperor-palpatine",
        name: "Emperor Palpatine",
        desc: "The dark lord of the Sith who orchestrated the fall of the Republic.",
        items: [
          { label: "Emperor Palpatine / Darth Sidious", nameFilter: ["Emperor Palpatine", "Darth Sidious", "Chancellor Palpatine"] }
        ]
      },
      {
        id: "darth-maul",
        name: "Darth Maul",
        desc: "A deadly Sith assassin known for his double-bladed lightsaber. His minifigures have evolved from the classic hooded look to detailed mechanical legs and silver armor variants.",
        items: [
          { label: "Hooded & Classic Era (1999-2010)", ids: ["sw0003", "sw0686", "sw0394"] },
          { label: "Horns & Cape Variants (2011-2024)", ids: ["sw0323", "sw0650", "sw0808", "sw1333"] },
          { label: "Mechanical Legs (2013-2020)", ids: ["sw0493", "sw1091"] },
          { label: "Silver Armor & Latest (2021-2025)", ids: ["sw1155", "sw1415"] },
          { label: "Special & Anniversary Editions", ids: ["sw0423", "sw0384", "sw1330"] }
        ]
      },
      {
        id: "count-dooku",
        name: "Count Dooku",
        desc: "A former Jedi Master who became the Sith Lord Darth Tyranus.",
        items: [
          { label: "Count Dooku", nameFilter: ["Count Dooku"] }
        ]
      },
      {
        id: "asajj-ventress",
        name: "Asajj Ventress",
        desc: "A Dathomirian dark side assassin who served Count Dooku.",
        items: [
          { label: "Asajj Ventress", nameFilter: ["Asajj Ventress"] }
        ]
      },
      {
        id: "savage-opress",
        name: "Savage Opress",
        desc: "A Nightbrother of Dathomir and brother to Darth Maul.",
        items: [
          { label: "Savage Opress", nameFilter: ["Savage Opress"] }
        ]
      }
    ]
  },
  {
    title: "2. The Inquisitorius",
    desc: "Dark side adepts tasked with hunting down surviving Jedi. These figures feature unique helmets, armor, and the iconic circular lightsaber hilts.",
    subsections: [
      {
        id: "grand-inquisitor",
        name: "The Grand Inquisitor",
        desc: "The leader of the Inquisitorius, answering directly to Darth Vader.",
        items: [
          { label: "The Grand Inquisitor", ids: ["sw0622", "sw1222"] }
        ]
      },
      {
        id: "inquisitors",
        name: "Inquisitors",
        desc: "Various brothers and sisters of the Inquisitorius who served the Empire.",
        items: [
          { label: "Fifth Brother", ids: ["sw0747", "sw1223"] },
          { label: "Third Sister (Reva)", ids: ["sw1237"] },
          { label: "Marrok", ids: ["sw1301"] }
        ]
      }
    ]
  },
  {
    title: "3. First Order Dark Side",
    desc: "The dark side users of the First Order.",
    subsections: [
      {
        id: "supreme-leader-snoke",
        name: "Supreme Leader Snoke",
        desc: "The mysterious leader of the First Order.",
        items: [
          { label: "Supreme Leader Snoke", nameFilter: ["Snoke"] }
        ]
      },
      {
        id: "knights-of-ren",
        name: "Knights of Ren",
        desc: "A dark side organization operating under the command of Kylo Ren.",
        items: [
          { label: "Knights of Ren", nameFilter: ["Knight of Ren", "Vicrul", "Ap'lek", "Ushar", "Cardo", "Kuruk", "Trudgen"] }
        ]
      }
    ]
  }
];
