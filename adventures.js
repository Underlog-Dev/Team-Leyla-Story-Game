// Adventure registry. Add new adventures here.
import train from './adv-train.js';
import forest from './adv-forest.js';
import voyage from './adv-voyage.js';
export const ADVENTURES = [train, forest, voyage];
export const advById = (id) => ADVENTURES.find((a) => a.id === id);
