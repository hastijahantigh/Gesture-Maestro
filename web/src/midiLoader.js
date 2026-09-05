import {Midi} from '@tonejs/midi'
export async function loadMidi(midiFile) {
const baseUrl = import.meta.env.BASE_URL
const midiUrl = `${baseUrl}midi/${midiFile}`
const midi = await Midi.fromUrl(midiUrl)

  return midi
}