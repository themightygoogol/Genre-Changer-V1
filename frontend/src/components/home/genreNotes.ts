export interface GenreNote {
  name: string;
  colour: string;
  description: string;
  history: string;
  characteristics: string[];
  source: { label: string; url: string };
}
export const genreNotes: Record<string, GenreNote> = {
  drill: {
    name: "Drill",
    colour: "#287995",
    description:
      "A darker branch of hip-hop built around weighty low end, tense melodies and an unmistakable rhythmic pulse.",
    history:
      "Drill emerged in Chicago in the early 2010s. South London developed its own variation around 2013, drawing on Chicago drill, grime and road rap.",
    characteristics: [
      "Heavy 808 bass",
      "Dark melodic loops",
      "Busy hi-hats and half-time drums",
    ],
    source: {
      label: "PBS · Sound Field",
      url: "https://www.pbs.org/video/why-have-so-many-countries-adopted-drill-rap-c05zdf/",
    },
  },
  metal: {
    name: "Metal",
    colour: "#34794f",
    description:
      "A powerful family of rock styles centred on amplified guitars, forceful rhythms and a dense, expressive sound.",
    history:
      "Heavy metal took shape in the late 1960s and early 1970s, growing from blues and psychedelic rock. Its many subgenres developed different approaches to speed, melody and intensity.",
    characteristics: [
      "Distorted guitar riffs",
      "Strong bass-and-drum foundation",
      "Guitar solos and emphatic vocals",
    ],
    source: {
      label: "Heavy metal · further reading",
      url: "https://en.wikipedia.org/wiki/Heavy_metal_music",
    },
  },
  house: {
    name: "House",
    colour: "#9a4668",
    description:
      "Electronic dance music driven by a steady pulse, repeating grooves and the energy of the club floor.",
    history:
      "House grew from Chicago's club and DJ culture in the 1980s, with roots in disco. DJs and producers shaped those influences into a new electronic dance sound.",
    characteristics: [
      "Four-on-the-floor kick",
      "Repeating bass and percussion",
      "Loop-based dance arrangements",
    ],
    source: {
      label: "Choose Chicago · house history",
      url: "https://www.choosechicago.com/blog/music/the-history-of-house-music-in-chicago/",
    },
  },
  lofi: {
    name: "Lo-Fi",
    colour: "#8d7329",
    description:
      "Here, lo-fi means relaxed instrumental hip-hop where texture and feel matter as much as clean, polished sound.",
    history:
      "Its production aesthetic draws on sampled hip-hop, dusty samplers and tape recordings. The term describes an approach to sound as well as a style of beats.",
    characteristics: [
      "Loose, laid-back grooves",
      "Tape hiss, clicks and pops",
      "Warm, imperfect textures",
    ],
    source: {
      label: "Ableton · lo-fi sound",
      url: "https://www.ableton.com/en/packs/lofi-hiphop/",
    },
  },
};
