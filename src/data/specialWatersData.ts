import { SpecialWater } from '../shared/types';

// Helper function to convert coordinates from "lat, long" format to [long, lat] format
const convertCoords = (coordStr: string): [number, number] => {
  const [lat, lng] = coordStr.split(',').map(c => parseFloat(c.trim()));
  return [lng, lat]; // Note: MapBox uses [longitude, latitude] format
};

// Special waters data organized by zone
const specialWatersData: Record<string, SpecialWater[]> = {
  'RFA 2': [
    // Extended Season Lakes
    {
      id: 'cameron-lake',
      name: 'Cameron Lake',
      area: 'Cameron Lake (Antigonish)',
      coordinates: [-61.98083333333334, 45.514805555555554],
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'copper-lake',
      name: 'Copper Lake',
      area: 'Copper Lake (Antigonish)',
      coordinates: [-61.985527777777776, 45.40361111111111],
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'gillis-lake-antigonish',
      name: 'Gillis Lake',
      area: 'Gillis Lake (Antigonish)',
      coordinates: [-60.397666666666666, 46.05958333333333],
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'goose-harbour-lake',
      name: 'Goose Harbour Lake',
      area: 'Goose Harbour Lake (Guysborough)',
      coordinates: [-61.41583333333333, 45.55152777777778],
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'mckeen-lake',
      name: 'McKeen Lake',
      area: 'McKeen Lake (Guysborough)',
      coordinates: [-62.037388888888884, 45.29347222222222],
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'pringle-lake',
      name: 'Pringle Lake',
      area: 'Pringle Lake (Guysborough)',
      coordinates: [-61.94983333333333, 45.37616666666667],
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'dryden-lake',
      name: 'Dryden Lake',
      area: 'Dryden Lake (Pictou)',
      coordinates: [-62.777166666666666, 45.391333333333336],
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'gairloch-lake',
      name: 'Gairloch Lake',
      area: 'Gairloch Lake (Pictou)',
      coordinates: [-62.83394444444445, 45.480222222222224],
      featureType: 'point',
      regulationType: 'extended-season'
    },
    
    // Catch and Release Lakes
    {
      id: 'stewart-lake',
      name: 'Stewart Lake',
      area: 'Stewart Lake (Antigonish)',
      coordinates: [-79.76386111111111, 45.14266666666666],
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'dobsons-lake',
      name: 'Dobsons Lake',
      area: 'Dobsons Lake (Guysborough)',
      coordinates: [-61.200361111111114, 45.33519444444445],
      featureType: 'point',
      regulationType: 'catch-release'
    },
    
    // St. Mary's River sections
    {
      id: 'st-marys-river-lower',
      name: 'St. Mary\'s River - Lower Section',
      area: 'St. Mary\'s River - Lower Section (Guysborough)',
      featureType: 'linear',
      coordinates: [
        [-61.983492, 45.143351], // Starting point
        [-61.978322, 45.175892], // Intermediate point 1
        [-62.068798, 45.276507], // Intermediate point 2
        [-62.062834, 45.299422]  // Ending point
      ],
      regulationType: 'special-season'
    },
    {
      id: 'st-marys-river-upper',
      name: 'St. Mary\'s River - Upper Section',
      area: 'St. Mary\'s River - Upper Section (Guysborough)',
      featureType: 'linear',
      coordinates: [
        [-62.062834, 45.299422], // Starting point
        [-62.063417, 45.280000], // Intermediate point 1 (estimated)
        [-62.063999, 45.255877], // Intermediate point 2
        [-62.660334, 45.263666]  // Ending point
      ],
      regulationType: 'fly-only'
    },
  ],
  
  'RFA 3': [
    // Lakes with Extended Season
    {
      id: 'albro-lake',
      name: 'Albro Lake',
      area: 'Albro Lake (Halifax)',
      coordinates: convertCoords('44.689253, -63.577498'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'lewis-lake',
      name: 'Lewis Lake',
      area: 'Lewis Lake (Halifax)',
      coordinates: convertCoords('44.686813, -63.843349'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'round-lake',
      name: 'Round Lake (Jerry Lawrence Park)',
      area: 'Round Lake (Jerry Lawrence Park)',
      coordinates: convertCoords('44.692282, -63.844156'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'maynard-lake',
      name: 'Maynard Lake',
      area: 'Maynard Lake (Halifax)',
      coordinates: convertCoords('44.670780, -63.552660'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'penhorn-lake',
      name: 'Penhorn Lake',
      area: 'Penhorn Lake (Halifax)',
      coordinates: convertCoords('44.675321, -63.540574'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'first-lake',
      name: 'First Lake',
      area: 'First Lake (Halifax)',
      coordinates: convertCoords('44.772037, -63.662609'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'cow-bay-pond',
      name: 'Cow Bay Pond',
      area: 'Cow Bay Pond (Halifax)',
      coordinates: convertCoords('44.616695, -63.427022'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'williams-lake',
      name: 'Williams Lake',
      area: 'Williams Lake (Halifax)',
      coordinates: convertCoords('44.620352, -63.594660'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'beck-lake',
      name: 'Beck Lake',
      area: 'Beck Lake (Lunenburg)',
      coordinates: convertCoords('44.346736, -64.415904'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'hutt-lake',
      name: 'Hutt Lake',
      area: 'Hutt Lake (Lunenburg)',
      coordinates: convertCoords('44.582355, -64.294301'),
      featureType: 'point',
      regulationType: 'extended-season'
    },
    {
      id: 'sucker-lake',
      name: 'Sucker Lake',
      area: 'Sucker Lake (Lunenburg)',
      coordinates: convertCoords('44.488825, -64.593381'),
      featureType: 'point',
      regulationType: 'extended-season'
    },

    // Lakes with Catch and Release Only
    {
      id: 'birch-hill-lake',
      name: 'Birch Hill Lake',
      area: 'Birch Hill Lake (Halifax)',
      coordinates: convertCoords('44.675141, -63.838273'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'blueberry-lake',
      name: 'Blueberry Lake',
      area: 'Blueberry Lake (Halifax)',
      coordinates: convertCoords('44.622763, -63.695833'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'east-duck-lake',
      name: 'East Duck Lake',
      area: 'East Duck Lake (Halifax)',
      coordinates: convertCoords('44.659502, -63.825913'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'five-island-lake',
      name: 'Five Island Lake',
      area: 'Five Island Lake (Halifax)',
      coordinates: convertCoords('44.663377, -63.807389'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'frederick-lake',
      name: 'Frederick Lake',
      area: 'Frederick Lake (Halifax)',
      coordinates: convertCoords('44.649740, -63.786717'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'holland-marsh-lake',
      name: 'Holland Marsh Lake',
      area: 'Holland Marsh Lake (Halifax)',
      coordinates: convertCoords('44.669538, -63.818934'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'hubley-big-lake',
      name: 'Hubley Big Lake',
      area: 'Hubley Big Lake (Halifax)',
      coordinates: convertCoords('44.648575, -63.830422'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'jacket-lake',
      name: 'Jacket Lake',
      area: 'Jacket Lake (Halifax)',
      coordinates: convertCoords('44.900567, -62.701627'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'lizard-lake',
      name: 'Lizard Lake',
      area: 'Lizard Lake (Halifax)',
      coordinates: convertCoords('44.665156, -63.791947'),
      featureType: 'point',
      regulationType: 'catch-release'
    },
    {
      id: 'sheldrake-lake',
      name: 'Sheldrake Lake',
      area: 'Sheldrake Lake (Halifax)',
      coordinates: convertCoords('44.676564, -63.797928'),
      featureType: 'point',
      regulationType: 'catch-release'
    },

    // Lakes with Special Limits
    {
      id: 'east-taylor-bay-lake',
      name: 'East Taylor Bay Lake',
      area: 'East Taylor Bay Lake (Halifax)',
      coordinates: convertCoords('44.893889, -62.653788'),
      featureType: 'point',
      regulationType: 'special-limit'
    },

    // Lakes with Atlantic Whitefish Protection
    {
      id: 'minamkeak-lake',
      name: 'Minamkeak Lake',
      area: 'Minamkeak Lake (Lunenburg)',
      coordinates: convertCoords('44.290559, -64.605361'),
      featureType: 'point',
      regulationType: 'special-season'
    },
    {
      id: 'milipsigate-lake',
      name: 'Milipsigate Lake',
      area: 'Milipsigate Lake (Lunenburg)',
      coordinates: convertCoords('44.331735, -64.604802'),
      featureType: 'point',
      regulationType: 'special-season'
    },
    {
      id: 'hebb-lake',
      name: 'Hebb Lake',
      area: 'Hebb Lake (Lunenburg)',
      coordinates: convertCoords('44.342364, -64.567279'),
      featureType: 'point',
      regulationType: 'special-season'
    },

    // Rivers with Special Regulations (Linear Features)
    
    // Musquodoboit River sections
    {
      id: 'musquodoboit-river-lower',
      name: 'Musquodoboit River - Lower Section',
      area: 'Musquodoboit River - Lower Section (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.713606, -63.082372'), // Starting point
        convertCoords('44.736, -63.095'),        // Intermediate point (estimated)
        convertCoords('44.755, -63.105'),        // Intermediate point (estimated)
        convertCoords('44.789570, -63.125192')  // Ending point
      ],
      regulationType: 'special-season'
    },
    {
      id: 'musquodoboit-river-middle',
      name: 'Musquodoboit River - Middle Section',
      area: 'Musquodoboit River - Middle Section (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.789570, -63.125192'), // Starting point
        convertCoords('44.790155, -63.132831'), // Intermediate point (estimated)
        convertCoords('44.790740, -63.140470')  // Ending point
      ],
      regulationType: 'special-season'
    },
    {
      id: 'musquodoboit-river-upper',
      name: 'Musquodoboit River - Upper Section',
      area: 'Musquodoboit River - Upper Section (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.790740, -63.140470'), // Starting point
        convertCoords('44.812, -63.165'),       // Intermediate point (estimated)
        convertCoords('44.842, -63.192'),       // Intermediate point (estimated)
        convertCoords('44.872023, -63.220576')  // Ending point
      ],
      regulationType: 'fly-only'
    },
    {
      id: 'musquodoboit-river-headwaters',
      name: 'Musquodoboit River - Headwaters',
      area: 'Musquodoboit River - Headwaters (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.872023, -63.220576'), // Starting point
        convertCoords('44.895, -63.230'),       // Intermediate point (estimated)
        convertCoords('44.918, -63.243'),       // Intermediate point (estimated)
        convertCoords('44.939875, -63.252337')  // Ending point
      ],
      regulationType: 'special-season'
    },

    // LaHave River sections
    {
      id: 'lahave-river-silver-hill',
      name: 'LaHave River - Silver Hill to Wentzells Lake',
      area: 'LaHave River - Silver Hill to Wentzells Lake (Lunenburg)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.394285, -64.534521'), // Starting point
        convertCoords('44.415, -64.550'),       // Intermediate point (estimated)
        convertCoords('44.445, -64.585'),       // Intermediate point (estimated)
        convertCoords('44.469983, -64.625401')  // Ending point
      ],
      regulationType: 'fly-only'
    },
    {
      id: 'lahave-river-wentzells',
      name: 'LaHave River - Wentzells Lake to New Germany Lake',
      area: 'LaHave River - Wentzells Lake to New Germany Lake (Lunenburg)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.469983, -64.625401'), // Starting point
        convertCoords('44.500, -64.660'),       // Intermediate point (estimated)
        convertCoords('44.525, -64.695'),       // Intermediate point (estimated)
        convertCoords('44.548792, -64.734649')  // Ending point
      ],
      regulationType: 'fly-only'
    },
    {
      id: 'lahave-river-morgans-falls',
      name: 'LaHave River - Morgans Falls',
      area: 'LaHave River - Morgans Falls (Lunenburg)',
      featureType: 'point', // Using point for this specific falls location
      coordinates: convertCoords('44.534346, -64.712380'),
      regulationType: 'closed'
    },

    // Petite Riviere
    {
      id: 'petite-riviere',
      name: 'Petite Riviere',
      area: 'Petite Riviere (Lunenburg)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.234257, -64.446499'), // Starting point
        convertCoords('44.265, -64.475'),       // Intermediate point (estimated)
        convertCoords('44.300, -64.515'),       // Intermediate point (estimated)
        convertCoords('44.342239, -64.565846')  // Ending point
      ],
      regulationType: 'fly-only'
    },

    // Moser River
    {
      id: 'moser-river',
      name: 'Moser River',
      area: 'Moser River (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.976517, -62.253253'), // Starting point
        convertCoords('44.995, -62.275'),       // Intermediate point (estimated)
        convertCoords('45.015, -62.290'),       // Intermediate point (estimated)
        convertCoords('45.027710, -62.303687')  // Ending point
      ],
      regulationType: 'fly-only'
    },

    // Sackville River
    {
      id: 'sackville-river',
      name: 'Sackville River',
      area: 'Sackville River (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.730344, -63.662264'), // Starting point
        convertCoords('44.745, -63.675'),       // Intermediate point (estimated)
        convertCoords('44.760, -63.695'),       // Intermediate point (estimated)
        convertCoords('44.774460, -63.713853')  // Ending point
      ],
      regulationType: 'fly-only'
    },

    // Little Sackville River
    {
      id: 'little-sackville-river',
      name: 'Little Sackville River',
      area: 'Little Sackville River (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.764249, -63.687392'), // Starting point
        convertCoords('44.775, -63.690'),       // Intermediate point (estimated)
        convertCoords('44.785, -63.692'),       // Intermediate point (estimated)
        convertCoords('44.799494, -63.694070')  // Ending point
      ],
      regulationType: 'fly-only'
    },

    // West River Sheet Harbour
    {
      id: 'west-river-sheet-harbour',
      name: 'West River Sheet Harbour',
      area: 'West River Sheet Harbour (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.927772, -62.545531'), // Starting point
        convertCoords('44.950, -62.585'),       // Intermediate point (estimated)
        convertCoords('44.975, -62.625'),       // Intermediate point (estimated)
        convertCoords('44.997367, -62.657345')  // Ending point
      ],
      regulationType: 'fly-only'
    },

    // Gold River
    {
      id: 'gold-river',
      name: 'Gold River',
      area: 'Gold River (Lunenburg)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.554188, -64.324785'), // Starting point
        convertCoords('44.585, -64.360'),       // Intermediate point (estimated)
        convertCoords('44.630, -64.410'),       // Intermediate point (estimated)
        convertCoords('44.677744, -64.456754')  // Ending point
      ],
      regulationType: 'fly-only'
    },

    // East River Sheet Harbour sections
    {
      id: 'east-river-sheet-harbour',
      name: 'East River Sheet Harbour - Barrier Dam to Malay Falls',
      area: 'East River Sheet Harbour - Barrier Dam to Malay Falls (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.955801, -62.498207'), // Starting point
        convertCoords('44.965, -62.495'),       // Intermediate point (estimated)
        convertCoords('44.975, -62.490'),       // Intermediate point (estimated)
        convertCoords('44.986554, -62.484925')  // Ending point
      ],
      regulationType: 'special-season'
    },
    {
      id: 'east-river-ruth-falls',
      name: 'East River Sheet Harbour - Ruth Falls',
      area: 'East River Sheet Harbour - Ruth Falls (Halifax)',
      featureType: 'linear',
      coordinates: [
        convertCoords('44.951269, -62.502847'), // Starting point
        convertCoords('44.953, -62.501'),       // Intermediate point (estimated)
        convertCoords('44.955271, -62.499577')  // Ending point
      ],
      regulationType: 'special-season'
    }
  ]
};

export default specialWatersData;
