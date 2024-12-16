import { HowlOptions } from "howler";

const audioBasePath = "/audio/sprites";

export const gameAudioConfig: HowlOptions = {
  src: [
    `${audioBasePath}/mygameaudio.ogg`,
    `${audioBasePath}/mygameaudio.m4a`,
    `${audioBasePath}/mygameaudio.mp3`,
    `${audioBasePath}/mygameaudio.ac3`,
  ],
  sprite: {
    "tune-loop": [0 * 1000, 15.880997732426303 * 1000, true],
    "good-luck": [17 * 1000, 0.718367346938777 * 1000, false],
    intro: [19 * 1000, 19.31755102040816 * 1000, false],
    "introduce-yourself": [40 * 1000, 1.39174603174603 * 1000, false],
    "letter-correct": [43 * 1000, 0.23074829931973 * 1000, false],
    "letter-wrong-position": [45 * 1000, 0.25396825396825 * 1000, false],
    "letter-wrong": [47 * 1000, 0.23074829931973 * 1000, false],
    "new-letter": [49 * 1000, 0.76480725623583 * 1000, false],
    "word-correct-1": [51 * 1000, 1.856145124716555 * 1000, false],
    "word-correct-2": [54 * 1000, 2.4366439909297 * 1000, false],
    "word-correct-3": [58 * 1000, 3.01714285714286 * 1000, false],
    "you-can-start": [63 * 1000, 1.13632653061225 * 1000, false],
  },
  autoplay: true,
};
