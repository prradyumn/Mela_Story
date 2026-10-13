// tools/indic_words.mjs: Indian names / words → Devanagari for the ElevenLabs voices (Oct 2026 feedback: "Mela", "Panchayat"… sounded
// British). Only the text SENT to the TTS changes; the on-screen text stays English. Used by gen_pari_el.mjs and gen_narr_el.mjs.
const W = [
  ["Apnapur's", 'अपनापुर्स'], ['Apnapur', 'अपनापुर'], ['Panchayat', 'पंचायत'], ['Sarpanch', 'सरपंच'], ['Mela', 'मेला'],
  ['Guddu', 'गुड्डू'], ['Bhaiya', 'भैया'], ['Mausi', 'मौसी'], ['Manju', 'मंजू'], ['Baba', 'बाबा'], ['Aaru', 'आरू'], ['Pari', 'परी'],
  ['Gudiya', 'गुड़िया'], ['Aakoli', 'आकोली'], ['bazaar', 'बाज़ार'], ['jalebees', 'जलेबी'], ['jalebis', 'जलेबी'], ['jalebi', 'जलेबी'],
  ['rangoli', 'रंगोली'], ['diyas', 'दीये'], ['potli', 'पोटली'], ['chaupal', 'चौपाल'], ['Namaste', 'नमस्ते'], ['lakh', 'लाख'], ['crore', 'करोड़'],
];
const RX = W.map(([en, hi]) => [new RegExp(`(?<![A-Za-z])${en.replace("'", "['’]")}(?![A-Za-z])`, 'gi'), hi]);
export const indic = t => RX.reduce((s, [rx, hi]) => s.replace(rx, hi), t);
export const INDIC_WORDS = W.map(w => w[0]);
