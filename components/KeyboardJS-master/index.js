import { Keyboard } from './lib/keyboard.js';
import { Locale } from './lib/locale.js';
import { KeyCombo } from './lib/key-combo.js';
import { us } from './locales/us.js';

const keyboard = new Keyboard();

keyboard.setLocale('us', us);

keyboard.Keyboard = Keyboard;
keyboard.Locale = Locale;
keyboard.KeyCombo = KeyCombo;

export default keyboard;
