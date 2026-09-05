import mido
m_file =mido.MidiFile("music/nocturne_in_b-flat_minor.mid")
print("Tracks:", len(m_file.tracks))
print("Ticks per beat:", m_file.ticks_per_beat)
print("Length:", m_file.length)

for track_index, track in enumerate(m_file.tracks):
    print(track_index, track.name, len(track))