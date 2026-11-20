-- Each habit wears an icon (a Lucide id from the app's set) and a chip colour (DESIGN.md v4).
alter table public.habits
  add column icon text not null default 'sprout'
    check (icon in (
      'dumbbell','footprints','bike','apple','egg','droplet','moon','sprout',
      'book-open','graduation-cap','brain','lightbulb','briefcase','notebook-pen','pencil','trophy',
      'wallet','coins','users','hand-heart','heart-handshake','phone','shirt','utensils')),
  add column color text not null default 'peach'
    check (color in ('peach','mint','sky','sun','rose','teal'));
