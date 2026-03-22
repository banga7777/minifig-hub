import { Minifigure } from '../../types';

export interface ArmySubSection {
  id: string;
  name: string;
  desc?: string;
  items: {
    label: string;
    ids: string[];
  }[];
}

export interface ArmySection {
  title: string;
  desc: string;
  subsections: ArmySubSection[];
}

export const CLONE_ARMY_DATA: ArmySection[] = [
  {
    title: "1. Technical Generations",
    desc: "Classification based on the evolution of LEGO molds and printing history. Understanding these generations is key to identifying rarity and value.",
    subsections: [
      {
        id: "phase-1-series",
        name: "Phase 1 (P1) Series",
        desc: "The Phase 1 clone trooper armor was the standard issue armor of the Grand Army of the Republic during the early years of the Clone Wars. Designed by Kaminoan armorers, it featured a distinctive fin and a T-shaped visor. In LEGO form, this era is characterized by classic helmet molds and the evolution from black/yellow heads to the stylized 'Clone Wars' animated faces. These figures are highly sought after for their historical significance in the LEGO Star Wars line, representing the very beginning of the Clone Wars era. Collectors value them for their nostalgic appeal and the unique design evolution from the earliest 2002 releases to the modern, highly detailed versions that incorporate realistic printing and the latest helmet mold technology. The transition from the classic animated style to the modern realistic printing has been a major milestone for collectors, marking the evolution of LEGO's design philosophy.",
        items: [
          { label: "Classic (2002-2008): Early helmet & black/yellow heads.", ids: ["sw0058", "sw0091"] },
          { label: "Clone Wars Style (2008-2014): Large eyes printing.", ids: ["sw0191", "sw0194", "sw0196", "sw0200", "sw0201", "sw0202", "sw0203", "sw0221", "sw0223", "sw0233", "sw0286", "sw0297", "sw0298", "sw0299", "sw0314", "sw0315", "sw0330", "sw0331", "sw0341", "sw0378", "sw0380", "sw0438", "sw0442", "sw0475", "sw0478", "sw0481", "sw0491", "sw0492", "sw0502", "sw0596", "sw0609", "sw0629", "sw0910", "sw1090"] },
          { label: "Modern P1 (2022+): Realism printing & Nougat skin tone.", ids: ["sw1151", "sw1189", "sw1408", "sw1425", "sw1429"] }
        ]
      },
      {
        id: "phase-2-series",
        name: "Phase 2 (P2) Series",
        desc: "Introduced in the later stages of the Clone Wars, Phase 2 armor was more comfortable and capable of supporting specialized modular attachments. It bridged the design gap between the Republic's clone troopers and the Empire's stormtroopers. Modern LEGO Phase 2 helmets (2020+) feature accessory holes for rangefinders and visors. This era is a favorite among collectors due to the high level of detail in the armor printing, which captures the battle-worn look of the late Clone Wars. The introduction of the helmet holes has revolutionized display possibilities, allowing for a vast array of custom configurations and tactical gear setups, making these figures essential for any serious army builder. The Phase 2 armor represents the peak of clone trooper design, reflecting the intense and prolonged combat of the later Clone Wars.",
        items: [
          { label: "Early P2 (2005-2019): Early P2 molds & Scowl face era.", ids: ["sw0118", "sw0126", "sw0127", "sw0128", "sw0129", "sw0130", "sw0131", "sw0189", "sw0265", "sw0266", "sw0272", "sw0281", "sw0377", "sw0439", "sw0445", "sw0450", "sw0453", "sw0518", "sw0519", "sw0522", "sw0523", "sw0524", "sw0525", "sw0528", "sw0531", "sw0537", "sw0541", "sw0605", "sw0606", "sw0608", "sw0837", "sw1002", "sw1003"] },
          { label: "Modern P2 (2020+ / Helmet Holes): Latest molds with accessory holes.", ids: ["sw1093", "sw1094", "sw1097", "sw1100", "sw1146", "sw1206", "sw1207", "sw1233", "sw1235", "sw1236", "sw1246", "sw1247", "sw1248", "sw1276", "sw1277", "sw1278", "sw1304", "sw1305", "sw1315", "sw1319", "sw1329", "sw1337", "sw1399", "sw1401", "sw1402", "sw1422", "sw1423", "sw1430", "sw1431"] }
        ]
      },
      {
        id: "special-unit-experimental",
        name: "Special Unit (Experimental)",
        desc: "Experimental units like Clone Force 99, also known as the Bad Batch, were elite clone commandos with desirable genetic mutations. Their unique armor and specialized skills made them a formidable force, reflected in their highly detailed and unique LEGO molds. These figures are prized for their individuality, as each member of the Bad Batch possesses distinct armor modifications, weapons, and personality-driven printing. Collectors value them not only for their rarity but also for the storytelling potential they bring to a display, representing the transition period between the Republic and the Empire. The Bad Batch figures stand out as some of the most complex and character-rich designs in the LEGO Star Wars line, capturing the unique personalities of each commando.",
        items: [
          { label: "Clone Force 99 (Bad Batch): Unique molds & printing.", ids: ["sw1148", "sw1149", "sw1150", "sw1152"] }
        ]
      }
    ]
  },
  {
    title: "2. Entity by Legions",
    desc: "Classification based on legion markings and affiliation.",
    subsections: [
      {
        id: "501st-legion",
        name: "🟦 501st Legion",
        desc: "Known as \"Vader's Fist,\" the 501st Legion was an elite unit of clone troopers led by Captain Rex under the command of Jedi General Anakin Skywalker. They were distinguished by their blue armor markings and participated in many of the most critical battles of the Clone Wars, eventually becoming the personal legion of Darth Vader. For collectors, the 501st Legion is perhaps the most iconic and sought-after clone unit in the LEGO Star Wars universe. The evolution of their blue-marked armor from the early 2000s to the modern, highly detailed versions with helmet holes has been a focal point for army builders. Owning a complete 501st squad, including various troopers, captains, and specialized units, is a hallmark of a dedicated collector, representing the tragic yet pivotal history of the unit that served both the Republic and the Empire. Their legacy is cemented in the history of the Clone Wars, making them a must-have for any collector looking to build a comprehensive Republic army.",
        items: [
          { label: "501st Troopers & Commanders", ids: ["sw0194", "sw0314", "sw0439", "sw0445", "sw0450", "sw1093", "sw1094", "sw1246", "sw1247", "sw1248", "sw1315", "sw1329", "sw1337"] },
          { label: "332nd Ahsoka's Company", ids: ["sw1097", "sw1276", "sw1277", "sw1278"] }
        ]
      },
      {
        id: "212th-attack-battalion",
        name: "🟧 212th Attack Battalion",
        desc: "Led by Commander Cody and Jedi General Obi-Wan Kenobi, the 212th Attack Battalion was famous for its orange-marked armor. They specialized in siege operations and high-intensity combat, most notably leading the invasion of Utapau to hunt down General Grievous. The 212th is a fan-favorite legion, and LEGO has captured their distinct orange markings across several generations of figures. Collectors prize these figures for their role in key cinematic moments, particularly the Battle of Utapau. The evolution of the 212th trooper design, from the early Clone Wars animated style to the current realistic printing, allows collectors to build a diverse and historically accurate representation of this battalion, making them a cornerstone of any Republic army display. Their presence in a collection adds a touch of classic Clone Wars intensity, reflecting the bravery and tactical skill of the troopers who fought alongside Obi-Wan Kenobi.",
        items: [
          { label: "212th Troopers & Commanders", ids: ["sw0196", "sw0341", "sw0453", "sw0522", "sw0523", "sw1100", "sw1233", "sw1235", "sw1236"] }
        ]
      },
      {
        id: "coruscant-guard",
        name: "🟥 Coruscant Guard (Shock Troopers)",
        desc: "The Coruscant Guard, or Shock Troopers, were elite clones tasked with the security of the Republic's capital world. Distinguished by their bold red markings, they served as bodyguards for Chancellor Palpatine and maintained order within the Senate District. Their role in the capital made them highly visible and essential to the Republic's internal security. For collectors, the Shock Troopers offer a striking contrast to the standard white armor of other legions. The red markings are not just aesthetic; they signify the unit's specialized role and their proximity to the highest levels of Republic government. Building a squad of Coruscant Guard troopers, including key figures like Commander Fox, is essential for recreating the political and military tension of the later Clone Wars era. Their distinct look and specialized role make them a unique and highly desirable addition to any Republic army collection.",
        items: [
          { label: "Shock Troopers & Fox", ids: ["sw0091", "sw0189", "sw0202", "sw0531", "sw1304", "sw1305"] }
        ]
      },
      {
        id: "104th-battalion",
        name: "🐺 104th Battalion (Wolfpack)",
        desc: "Also known as the \"Wolfpack,\" the 104th Battalion was led by Commander Wolffe under Jedi General Plo Koon. After suffering heavy losses early in the war, they adopted grey/sand-blue markings and became one of the most resilient and tactically flexible units in the Grand Army. The Wolfpack is highly regarded by collectors for their unique color scheme, which stands out among the more common blue or orange legions. The figures, particularly Commander Wolffe, are prized for their detailed helmet prints and the inclusion of specialized gear. Building a Wolfpack squad allows collectors to showcase a unit that represents the tactical versatility and resilience of the clones, making them a fantastic addition to any Republic army display that focuses on the more specialized and battle-hardened units of the Clone Wars.",
        items: [
          { label: "Wolfpack Troopers & Wolffe", ids: ["sw0330", "sw0331", "sw0537"] }
        ]
      },
      {
        id: "41st-elite-corps",
        name: "🌿 41st Elite Corps (Kashyyyk)",
        desc: "Led by Commander Gree and Jedi Grand Master Yoda, the 41st Elite Corps specialized in planetary scouting and environmental warfare. They are best known for their camouflage armor used during the defense of Kashyyyk against the Separatist invasion. The 41st Elite Corps is essential for collectors who want to recreate the iconic Battle of Kashyyyk. The camouflage printing on these figures is a testament to LEGO's attention to detail, capturing the unique look of troopers adapted for forest and jungle environments. Collectors value these figures for their distinct visual style and their association with one of the most memorable battles in the Star Wars prequel trilogy, making them a must-have for any serious Republic army builder. Their camouflage armor adds a level of visual interest and tactical realism that is unmatched by other legions, making them a standout unit in any collection.",
        items: [
          { label: "Kashyyyk Troopers & Gree", ids: ["sw0131", "sw0298", "sw0380", "sw0518", "sw0519", "sw0528", "sw1002", "sw1003"] }
        ]
      },
      {
        id: "187th-legion",
        name: "🟪 187th Legion (Windu's Purple)",
        desc: "Recognizable by their striking purple markings, the 187th Legion was closely associated with Jedi Master Mace Windu. In LEGO form, these troopers are highly sought after for their unique color scheme and limited set appearances. The 187th Legion offers a distinct visual flair that sets them apart from the more common legions, making them a centerpiece for any collector who appreciates unique color palettes. The purple markings are not just a design choice; they represent the legion's connection to Mace Windu and their role in specialized combat operations. For army builders, adding a squad of 187th troopers brings a vibrant and visually arresting element to their collection, showcasing the diversity of the Grand Army of the Republic and the influence of individual Jedi Masters on their troops.",
        items: [
          { label: "187th Troopers", ids: ["sw1206", "sw1207"] }
        ]
      },
      {
        id: "327th-star-corps",
        name: "🟡 327th Star Corps",
        desc: "Led by Clone Commander Bly and Jedi General Aayla Secura, the 327th Star Corps was known for its distinctive yellow markings and heavy use of ARC trooper equipment like kamas and pauldrons. They served extensively on the Outer Rim Sieges. The 327th Star Corps is a favorite among collectors for their unique yellow color scheme and their association with Aayla Secura. The inclusion of specialized gear like kamas and pauldrons on these troopers adds a level of detail that makes them stand out in any display. Collectors value these figures for their role in the Outer Rim Sieges, a critical and often overlooked part of the Clone Wars. Building a 327th squad allows collectors to recreate the diverse and specialized nature of the Republic's forces, adding depth and historical context to their collection.",
        items: [
          { label: "Star Corps Troopers & Bly", ids: ["sw0128", "sw1422", "sw1423", "sw1429"] }
        ]
      },
      {
        id: "geonosis-others",
        name: "🟤 Geonosis / Others",
        desc: "Various specialized units and planetary defense forces, such as the Geonosis troopers with their dark orange camouflage, the 91st Recon Corps, and the Galactic Marines. These niche units offer unique visual variety for army builders.",
        items: [
          { label: "Geonosis Units", ids: ["sw0605", "sw0606"] },
          { label: "91st Recon Corps", ids: ["sw0130", "sw0297", "sw0524"] },
          { label: "442nd Siege Battalion", ids: ["sw0129"] },
          { label: "21st Nova Corps (Galactic Marine)", ids: ["sw1430", "sw1431"] }
        ]
      }
    ]
  },
  {
    title: "3. Verified Classes",
    desc: "Classification by rank, specialist role, and elite status.",
    subsections: [
      {
        id: "p1-rank-commander-hierarchy",
        name: "P1 Rank & Commander Hierarchy",
        desc: "During the early Clone Wars, clone officer ranks were denoted by armor color rather than specialized gear: Yellow for Commanders, Red for Captains, Blue for Lieutenants, and Green for Sergeants. These classic LEGO figures are highly nostalgic and collectible.",
        items: [
          { label: "Commander (Yellow)", ids: ["sw0196", "sw0202", "sw0330", "sw0341", "sw0380", "sw0481", "sw1146", "sw1152", "sw1429", "sw1431"] },
          { label: "Captain (Red/Orange)", ids: ["sw0194", "sw0265", "sw0314", "sw0450", "sw0492", "sw1277", "sw1315", "sw1401"] },
          { label: "Lieutenant (Blue)", ids: ["sw0502", "sw0629"] },
          { label: "Sergeant (Green)", ids: ["sw0438", "sw1148"] }
        ]
      },
      {
        id: "specialist-roles",
        name: "Specialist Roles",
        desc: "The Grand Army utilized specialized clones for specific combat roles. Pilots operated fighters and gunships, Gunners manned heavy artillery, and ARF/Scout troopers conducted reconnaissance. LEGO has produced numerous variants of these specialized helmets over the years.",
        items: [
          { label: "Pilot", ids: ["sw0191", "sw0266", "sw0281", "sw0355", "sw0439", "sw0491", "sw0525", "sw0608", "sw0609", "sw1399", "sw1402", "sw1425"] },
          { label: "Gunner", ids: ["sw0221", "sw0837", "sw1236"] },
          { label: "Recon / ARF / Scout", ids: ["sw0131", "sw0297", "sw0315", "sw0378", "sw0518", "sw1002"] },
          { label: "Modern Specialists", ids: ["sw1246", "sw1247", "sw1248"] }
        ]
      },
      {
        id: "elite-units",
        name: "Elite Units (ARC & Commando)",
        desc: "Advanced Recon Commandos (ARC Troopers) and Clone Commandos were the best of the best. Tasked with the most dangerous covert missions, they featured upgraded armor, kamas, pauldrons, and specialized weaponry. Their LEGO counterparts are among the most detailed and prized minifigures.",
        items: [
          { label: "ARC Troopers", ids: ["sw0377", "sw1329"] },
          { label: "Bad Batch", ids: ["sw1148", "sw1149", "sw1150", "sw1152", "sw1151"] }
        ]
      }
    ]
  }
];

export const STORMTROOPER_ARMY_DATA: ArmySection[] = [
  {
    title: "1. 1st Generation: Classic Mold Era (1999–2013)",
    desc: "The nostalgic era of early LEGO Star Wars. Characterized by simple printing and solid-colored head pieces.",
    subsections: [
      {
        id: "classic-infantry-crew",
        name: "🏛️ Infantry & Ship Crew",
        desc: "The first generation of Stormtroopers emerged as the Galactic Empire transitioned from the Republic. These early units utilized armor designs that closely mirrored the late-war Clone Trooper equipment, emphasizing the shift from a defensive force to an instrument of imperial dominance.",
        items: [
          { label: "Standard Troopers", ids: ["sw0036", "sw0036a", "sw0036b", "sw0097", "sw0122", "sw0188", "sw0188a", "sw0208", "sw0208a"] }
        ]
      },
      {
        id: "classic-environmental-specialists",
        name: "🏜️ Environmental Specialists",
        desc: "To maintain control over a diverse galaxy, the Empire developed specialized troopers for extreme conditions. Sandtroopers were deployed to desert worlds like Tatooine with heat-resistant armor and survival gear, while Snowtroopers utilized insulated suits and heated breath masks for sub-zero environments like Hoth.",
        items: [
          { label: "Sandtroopers", ids: ["sw0109", "sw0109a", "sw0199", "sw0271"] },
          { label: "Snowtroopers", ids: ["sw0080", "sw0101", "sw0115"] },
          { label: "Recon & Pilots", ids: ["sw0005", "sw0005a", "sw0177", "sw0262"] }
        ]
      },
      {
        id: "classic-disguise-special-units",
        name: "🎭 Disguise & Special Units",
        desc: "Early LEGO Star Wars sets occasionally featured heroes like Luke Skywalker and Han Solo in Stormtrooper disguise, as well as the first iterations of Shadow Troopers. These classic figures hold significant nostalgic value for long-time collectors.",
        items: [
          { label: "Heroes in Disguise", ids: ["sw0204", "sw0205", "sw0205a"] },
          { label: "Early Shadow Troopers", ids: ["sw0166a", "sw0166b"] }
        ]
      }
    ]
  },
  {
    title: "2. 2nd Generation: Modern Detail Era (2014–2018)",
    desc: "Significant improvements in helmet accuracy and full-body printing detail.",
    subsections: [
      {
        id: "modern-infantry-officers",
        name: "🎖️ Elite Infantry & Officers",
        desc: "The second generation of LEGO Stormtroopers brought a massive leap in printing technology. Leg printing became standard, and helmet proportions were refined to closely match the on-screen appearance of the Imperial infantry.",
        items: [
          { label: "High-Detail Troopers", ids: ["sw0366", "sw0548", "sw0571", "sw0578", "sw0583", "sw0585", "sw0617", "sw0630", "sw0691", "sw0692", "sw0769", "sw0772", "sw0774", "sw0777", "sw0912"] }
        ]
      },
      {
        id: "special-ops-rogue-solo",
        name: "🌊 Special Ops (Rogue One / Solo)",
        desc: "Elite Imperial units were created for high-stakes missions. Death Troopers served as the terrifying guards for high-ranking intelligence officers, while Shoretroopers were specialized for coastal defense on tropical worlds like Scarif, where the Empire's most secret projects were housed.",
        items: [
          { label: "Coastal (Shoretroopers)", ids: ["sw0787", "sw0815", "sw0850"] },
          { label: "Urban & Frontier", ids: ["sw0914", "sw0919", "sw0925", "sw0927", "sw0934", "sw0950"] },
          { label: "Elite (Death Troopers)", ids: ["sw0796", "sw0807"] }
        ]
      },
      {
        id: "modern-environmental-specialists",
        name: "❄️ Environmental Specialists",
        desc: "Updated versions of the Sandtrooper and Snowtrooper featured highly detailed dirt printing, fabric pauldrons, and intricate survival backpacks, making them vastly superior to their classic era counterparts in terms of screen accuracy.",
        items: [
          { label: "Sandtroopers", ids: ["sw0364", "sw0383", "sw0548a", "sw0894", "sw0960", "sw0961"] },
          { label: "Snowtroopers", ids: ["sw0428", "sw0463", "sw0568", "sw0580", "sw0764", "sw0764b"] },
          { label: "Recon & Pilots", ids: ["sw0005b", "sw0505", "sw0374"] }
        ]
      }
    ]
  },
  {
    title: "3. 3rd Generation: Premium Dual Mold Era (2019–Present)",
    desc: "The current pinnacle of detail. Helmets feature dual-injected plastic for unparalleled accuracy.",
    subsections: [
      {
        id: "dual-mold-standard-disguise",
        name: "💎 Imperial Standard & Disguise",
        desc: "The pinnacle of LEGO Stormtrooper design. The dual-mold helmet technique uses two different colors of plastic injected together, creating perfectly crisp black visors and vents that cannot wear off like traditional surface printing.",
        items: [
          { label: "Dual-Mold Standard", ids: ["sw0997", "sw0997a", "sw0997b", "sw1137", "sw1167", "sw1168", "sw1275", "sw1326", "sw1327", "sw1454", "sw1455", "sw1456", "sw1463", "sw1464"] },
          { label: "Specialist & Recon", ids: ["sw1007", "sw1116", "sw1157", "sw1182", "sw1229", "sw1265"] },
          { label: "Elite & Others", ids: ["sw1031", "sw1161", "sw1416"] },
          { label: "Modern Disguise", ids: ["sw1203", "sw1460", "sw1204", "sw1458"] }
        ]
      },
      {
        id: "dual-mold-snowtroopers",
        name: "🏔️ Modern Snowtroopers (Dual Mold)",
        desc: "Modern Snowtroopers benefit from advanced printing and updated helmet molds, perfectly capturing the chilling efficiency of the Imperial forces deployed during the Battle of Hoth.",
        items: [
          { label: "Hoth Garrison", ids: ["sw1009", "sw1102", "sw1103", "sw1177", "sw1178", "sw1179", "sw1180", "sw1181"] }
        ]
      },
      {
        id: "new-era-special-models",
        name: "🌑 New Era & Special Models",
        desc: "Recent additions to the Imperial ranks include specialized variants like the Artillery Stormtrooper and the eerie Night Troopers from the Ahsoka series, featuring unique gold repairs and zombie-like details.",
        items: [
          { label: "Special Variants", ids: ["sw1479", "sw1378", "sw1375", "sw1475"] },
          { label: "Night Troopers (Ahsoka)", ids: ["sw1358", "sw1417"] }
        ]
      }
    ]
  },
  {
    title: "4. First Order Cluster",
    desc: "The forces of the Sequel Era, featuring a distinct visual language from the original Empire.",
    subsections: [
      {
        id: "first-order-standard-specialist",
        name: "Standard & Specialist",
        desc: "Rising from the ashes of the Empire, the First Order Stormtroopers featured a sleeker, more modern armor design. Their LEGO figures reflect this with smooth, minimalist helmet molds and crisp black-and-white contrast.",
        items: [
          { label: "Main Forces", ids: ["sw0664", "sw0666", "sw0667", "sw0695", "sw0722", "sw0842", "sw0872", "sw0886", "sw0905", "sw0962", "sw1055"] }
        ]
      },
      {
        id: "first-order-snow-desert",
        name: "Snow & Desert",
        desc: "The First Order also deployed specialized units like the Flametrooper and Snowtrooper, featuring unique, narrow-slit visors and heavy environmental gear designed for the harsh conditions of Starkiller Base and beyond.",
        items: [
          { label: "Environmental Units", ids: ["sw0656", "sw0657", "sw0701", "sw0875", "sw1053", "sw0992", "sw1131", "sw1132"] }
        ]
      }
    ]
  }
];

export const DROID_ARMY_DATA: ArmySection[] = [
  {
    title: "1. B1 Battle Droid Series (Standard & Specialized)",
    desc: "The most fundamental infantry lineup.",
    subsections: [
      {
        id: "b1-standard-infantry",
        name: "🎖️ Early Models & Standard Infantry (The Classics)",
        desc: "The B1 Battle Droid was the backbone of the Separatist Droid Army. Designed for mass production and low cost, they relied on overwhelming numbers rather than individual skill. Their distinctive \"Roger Roger\" response became synonymous with the mechanical might of the CIS.",
        items: [
          { label: "Classic Tan (sw0001a~d)", ids: ["sw0001a", "sw0001b", "sw0001c", "sw0001d"] },
          { label: "Geonosian Red", ids: ["sw0061", "sw0467"] },
          { label: "Scrap Battle Droid", ids: ["sw1447"] }
        ]
      },
      {
        id: "b1-specialized-commanders",
        name: "🚀 Specialized Units & Commanders",
        desc: "To coordinate the massive droid armies, the Separatists used color-coded B1 variants. Yellow markings denoted OOM command droids, red for security, and blue for pilots. These early LEGO variants are classic army building staples.",
        items: [
          { label: "Commander (Yellow Marking)", ids: ["sw0048", "sw0184", "sw0415", "sw0482"] },
          { label: "Security (Red Marking)", ids: ["sw0047", "sw0096", "sw0347", "sw0600"] },
          { label: "Pilot (Blue Marking)", ids: ["sw0065", "sw0095", "sw0300", "sw1338"] }
        ]
      }
    ]
  },
  {
    title: "2. B2 Super Battle Droids & Heavy Support",
    desc: "Heavy armored units responsible for powerful fire support.",
    subsections: [
      {
        id: "b2-models-jetpacks",
        name: "🤖 B2 Models & Jetpacks",
        desc: "A significant upgrade over the B1, the B2 Super Battle Droid featured heavy armor and integrated wrist blasters. They were designed to withstand heavy fire and push through enemy lines, serving as the heavy infantry of the Separatist legions.",
        items: [
          { label: "B2 Super Battle Droids", ids: ["sw0056", "sw0092", "sw0230", "sw1321"] },
          { label: "Rocket Battle Droid", ids: ["sw0228"] }
        ]
      }
    ]
  },
  {
    title: "3. Specialist Elite (Tactical & Commando)",
    desc: "Elite units with higher intelligence than standard droids.",
    subsections: [
      {
        id: "droid-elite-units",
        name: "⚡ Elite Units",
        desc: "The Separatists utilized high-end droids for specialized missions. Commando Droids were agile and intelligent infiltrators, while the MagnaGuard served as the personal bodyguards for General Grievous, capable of engaging Jedi in melee combat with electrostaffs.",
        items: [
          { label: "Commando Droid", ids: ["sw0359", "sw0448", "sw1427"] },
          { label: "Tactical Droid (TX-20)", ids: ["sw0312"] },
          { label: "MagnaGuard", ids: ["sw0190"] }
        ]
      }
    ]
  },
  {
    title: "4. Droideka: The Destroyer Droids",
    desc: "Destroyers built with bricks, showcasing new designs with every iteration.",
    subsections: [
      {
        id: "droideka-generations",
        name: "🌀 Droideka Generations",
        desc: "Also known as \"Destroyer Droids,\" Droidekas were among the most feared units in the Separatist arsenal. Capable of rolling into a ball for rapid deployment and deploying a powerful energy shield once stationary, they could pin down entire squads of clones or even Jedi.",
        items: [
          { label: "Early Era (Radar Head)", ids: ["sw0063", "sw0164"] },
          { label: "Mechanical Era", ids: ["sw0348", "sw0441"] },
          { label: "Modern Era", ids: ["sw0642", "sw1340", "sw1452"] },
          { label: "Sniper Droid", ids: ["sw0447"] }
        ]
      }
    ]
  }
];
