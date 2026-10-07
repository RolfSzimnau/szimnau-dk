import type { Lang } from './ui';

// Automation library entries. YAML comes from the blog posts with entity IDs
// replaced by placeholders, so no device, room or person names are published.
// Text is written separately per language, never translated.

export interface AutomationText {
  title: string;
  summary: string;
  trigger: string;
  conditions: string;
  actions: string;
  needs: string;
}

export interface AutomationEntry {
  id: string;
  post: string; // translationKey of the post with the full story
  yaml: Array<{ caption: Record<Lang, string>; code: string }>;
  text: Record<Lang, AutomationText>;
}

export const automations: AutomationEntry[] = [
  {
    id: 'tv-pause-phone-call',
    post: 'tv-pause-phone-calls',
    yaml: [
      {
        caption: { en: 'Automation', da: 'Automation', de: 'Automatisierung' },
        code: `alias: TV — Pause on phone call
trigger:
  - platform: state
    entity_id: sensor.your_phone_phone_state
    to: [ringing, in_call, offhook]
condition:
  - condition: state
    entity_id: remote.living_room_tv
    state: "on"
  - condition: state
    entity_id: input_boolean.tv_was_playing
    state: "off"
action:
  - action: input_boolean.turn_on
    target:
      entity_id: input_boolean.tv_was_playing
  - action: remote.send_command
    target:
      entity_id: remote.living_room_tv
    data:
      command: MEDIA_PAUSE
  - wait_for_trigger:
      - platform: state
        entity_id: sensor.your_phone_phone_state
        to: idle
    timeout: "02:00:00"
    continue_on_timeout: true
  - delay:
      seconds: 2
  - condition: state
    entity_id: input_boolean.tv_was_playing
    state: "on"
  - action: remote.send_command
    target:
      entity_id: remote.living_room_tv
    data:
      command: MEDIA_PLAY
  - action: input_boolean.turn_off
    target:
      entity_id: input_boolean.tv_was_playing`,
      },
    ],
    text: {
      en: {
        title: 'Pause the TV when a phone rings',
        summary: 'Pauses the TV the moment a phone rings and resumes two seconds after the call ends, but only if the automation was the one that paused it.',
        trigger: 'The phone state sensor from the Companion app changes to ringing, in_call or offhook.',
        conditions: 'The TV is on, and the helper input_boolean.tv_was_playing is off.',
        actions: 'Set the helper, send pause, wait for idle (two hours at most), wait two seconds, send play, clear the helper.',
        needs: 'Home Assistant Companion app on the phone, the Android TV integration and one input_boolean helper.',
      },
      da: {
        title: 'Sæt TV’et på pause, når telefonen ringer',
        summary: 'TV’et går på pause, så snart telefonen ringer, og fortsætter to sekunder efter, at samtalen er slut. Men kun hvis det var automationen, der satte det på pause.',
        trigger: 'Telefonens tilstandssensor fra Companion-appen skifter til ringing, in_call eller offhook.',
        conditions: 'TV’et er tændt, og hjælperen input_boolean.tv_was_playing er slået fra.',
        actions: 'Slå hjælperen til, send pause, vent på idle (højst to timer), vent to sekunder, send play, slå hjælperen fra.',
        needs: 'Home Assistant Companion-appen på telefonen, Android TV-integrationen og én input_boolean-hjælper.',
      },
      de: {
        title: 'Fernseher pausieren, wenn das Handy klingelt',
        summary: 'Der Fernseher pausiert, sobald ein Handy klingelt, und läuft zwei Sekunden nach dem Gespräch weiter. Aber nur, wenn die Automatisierung ihn auch angehalten hat.',
        trigger: 'Der Telefonstatus-Sensor der Companion-App wechselt auf ringing, in_call oder offhook.',
        conditions: 'Der Fernseher ist an, und der Helfer input_boolean.tv_was_playing steht auf aus.',
        actions: 'Helfer einschalten, Pause senden, auf idle warten (höchstens zwei Stunden), zwei Sekunden warten, Play senden, Helfer ausschalten.',
        needs: 'Home Assistant Companion-App auf dem Handy, die Android-TV-Integration und ein input_boolean-Helfer.',
      },
    },
  },
  {
    id: 'window-heating-blueprint',
    post: 'window-heating-automation',
    yaml: [
      {
        caption: {
          en: 'Blueprint: /config/blueprints/automation/homeassistant/window_heating_control.yaml',
          da: 'Blueprint: /config/blueprints/automation/homeassistant/window_heating_control.yaml',
          de: 'Blueprint: /config/blueprints/automation/homeassistant/window_heating_control.yaml',
        },
        code: `blueprint:
  name: "Window → Heating off"
  domain: automation
  input:
    window_sensor:
      selector:
        entity:
          domain: binary_sensor
          device_class: window
    climate_entity:
      selector:
        entity:
          domain: climate
    delay_minutes:
      default: 1
      selector:
        number:
          min: 0
          max: 10
          unit_of_measurement: min

mode: restart

trigger:
  - platform: state
    entity_id: !input window_sensor
    to: "on"
    for:
      minutes: !input delay_minutes
    id: opened
  - platform: state
    entity_id: !input window_sensor
    to: "off"
    id: closed

action:
  - choose:
      - conditions:
          - condition: trigger
            id: opened
        sequence:
          - action: scene.create
            data:
              scene_id: "{{ this.entity_id | replace('automation.', '') }}"
              snapshot_entities:
                - !input climate_entity
          - action: climate.set_hvac_mode
            target:
              entity_id: !input climate_entity
            data:
              hvac_mode: "off"
      - conditions:
          - condition: trigger
            id: closed
        sequence:
          - action: scene.turn_on
            target:
              entity_id: "scene.{{ this.entity_id | replace('automation.', '') }}"
            continue_on_error: true`,
      },
      {
        caption: { en: 'One instance per room', da: 'Én instans pr. rum', de: 'Eine Instanz pro Raum' },
        code: `- alias: "Window → Heating: bedroom"
  use_blueprint:
    path: homeassistant/window_heating_control.yaml
    input:
      window_sensor: binary_sensor.bedroom_window
      climate_entity: climate.bedroom
      delay_minutes: 1`,
      },
    ],
    text: {
      en: {
        title: 'Heating off when a window opens (blueprint)',
        summary: 'Turns a radiator off once a window has been open for a minute, and puts back its exact previous state when the window closes. Built as a blueprint, so the next room takes about 30 seconds.',
        trigger: 'The window has been open for the chosen number of minutes, or the window closes.',
        conditions: 'None. A quick airing never fires, because the open trigger waits for the delay.',
        actions: 'On open: snapshot the radiator into a scene, then set it to off. On close: restore the scene.',
        needs: 'A window sensor with device_class window and a climate entity. Tested with first-generation Mill radiators.',
      },
      da: {
        title: 'Varmen slukker, når vinduet åbnes (blueprint)',
        summary: 'Radiatoren slukker, når vinduet har stået åbent i et minut, og får præcis sin tidligere tilstand tilbage, når vinduet lukkes. Lavet som blueprint, så næste rum tager omkring 30 sekunder.',
        trigger: 'Vinduet har været åbent i det valgte antal minutter, eller vinduet lukkes.',
        conditions: 'Ingen. En hurtig udluftning udløser den aldrig, fordi triggeren venter på forsinkelsen.',
        actions: 'Ved åbning: gem radiatorens tilstand i en scene, og sluk den. Ved lukning: gendan scenen.',
        needs: 'En vinduessensor med device_class window og en klima-entitet. Testet med Mill-radiatorer af første generation.',
      },
      de: {
        title: 'Heizung aus bei offenem Fenster (Blueprint)',
        summary: 'Der Heizkörper geht aus, wenn das Fenster eine Minute offen ist, und bekommt beim Schließen genau seinen vorherigen Zustand zurück. Als Blueprint gebaut, der nächste Raum dauert etwa 30 Sekunden.',
        trigger: 'Das Fenster ist die eingestellte Zahl an Minuten offen, oder das Fenster wird geschlossen.',
        conditions: 'Keine. Kurzes Lüften löst nichts aus, weil der Auslöser die Verzögerung abwartet.',
        actions: 'Beim Öffnen: Zustand des Heizkörpers in einer Szene sichern und ausschalten. Beim Schließen: Szene wiederherstellen.',
        needs: 'Ein Fenstersensor mit device_class window und eine Klima-Entität. Getestet mit Mill-Heizkörpern der ersten Generation.',
      },
    },
  },
  {
    id: 'outdoor-lights-sunset',
    post: 'outdoor-lights-sunset-schedule',
    yaml: [
      {
        caption: { en: 'Two automations', da: 'To automationer', de: 'Zwei Automatisierungen' },
        code: `- alias: Outdoor lights — Sunset on
  trigger:
    - platform: sun
      event: sunset
      offset: "+00:15:00"
  action:
    - action: light.turn_on
      target:
        entity_id:
          - light.outdoor_1
          - light.outdoor_2
      data:
        brightness_pct: 100

- alias: Outdoor lights — Midnight off
  trigger:
    - platform: time
      at: "00:00:00"
  action:
    - action: light.turn_off
      target:
        entity_id:
          - light.outdoor_1
          - light.outdoor_2`,
      },
    ],
    text: {
      en: {
        title: 'Outdoor lights on at sunset, off at midnight',
        summary: 'Turns the outdoor lights on 15 minutes after sunset and off at midnight, all year, without adjusting a timer when the seasons change.',
        trigger: 'Sunset plus 15 minutes for on, and 00:00 for off.',
        conditions: 'None.',
        actions: 'Turn the outdoor lights on at full brightness, then off again at midnight.',
        needs: 'Any lights in Home Assistant. In my setup that is Govee and LEDVANCE.',
      },
      da: {
        title: 'Udendørslys tænder ved solnedgang og slukker ved midnat',
        summary: 'Udendørslyset tænder et kvarter efter solnedgang og slukker ved midnat hele året. Der er ikke noget timerur, der skal stilles om efter årstiden.',
        trigger: 'Solnedgang plus 15 minutter for at tænde, og midnat for at slukke.',
        conditions: 'Ingen.',
        actions: 'Tænd udendørslyset på fuld styrke, og sluk det igen ved midnat.',
        needs: 'Hvilke som helst lamper i Home Assistant. Hos mig er det Govee og LEDVANCE.',
      },
      de: {
        title: 'Außenlicht an bei Sonnenuntergang, aus um Mitternacht',
        summary: 'Das Außenlicht geht eine Viertelstunde nach Sonnenuntergang an und um Mitternacht aus, das ganze Jahr, ohne dass eine Zeitschaltuhr umgestellt werden muss.',
        trigger: 'Sonnenuntergang plus 15 Minuten zum Einschalten, 0 Uhr zum Ausschalten.',
        conditions: 'Keine.',
        actions: 'Außenlicht mit voller Helligkeit einschalten und um Mitternacht wieder aus.',
        needs: 'Beliebige Leuchten in Home Assistant. Bei mir sind es Govee und LEDVANCE.',
      },
    },
  },
  {
    id: 'circadian-lighting',
    post: 'wiz-circadian-lighting',
    yaml: [
      {
        caption: { en: 'Automation', da: 'Automation', de: 'Automatisierung' },
        code: `alias: Circadian lighting
trigger:
  - platform: time_pattern
    minutes: "/30"
  - platform: state
    entity_id:
      - light.lamp_1
      - light.lamp_2
      - light.lamp_3
      - light.lamp_4
    to: "on"
    for: "00:00:05"
variables:
  elevation: "{{ state_attr('sun.sun', 'elevation') | float(0) }}"
  color_temp_k: >
    {{ [[5000 if elevation > 45
         else ((3500 + (elevation - 15) / 30 * 1500) | int) if elevation > 15
         else ((2700 + elevation / 15 * 800) | int) if elevation > 0
         else 2200,
        2200] | max,
       6500] | min }}
action:
  - repeat:
      for_each:
        - light.lamp_1
        - light.lamp_2
        - light.lamp_3
        - light.lamp_4
      sequence:
        - if:
            - condition: template
              value_template: "{{ is_state(repeat.item, 'on') }}"
          then:
            - action: light.turn_on
              target:
                entity_id: "{{ repeat.item }}"
              data:
                color_temp_kelvin: "{{ color_temp_k }}"`,
      },
    ],
    text: {
      en: {
        title: 'Circadian lighting from the sun’s elevation',
        summary: 'Every 30 minutes, and whenever a lamp is switched on, the colour temperature follows the sun: cool at noon, warm at dusk. Lamps that are off stay off.',
        trigger: 'Every 30 minutes, or a lamp has been on for five seconds.',
        conditions: 'None in the trigger. Inside the loop, only lamps that are already on are touched.',
        actions: 'Turn the sun’s elevation into 2200 to 6500 K and set that colour temperature on each lamp that is on.',
        needs: 'Lamps with colour temperature support (WiZ in my setup) and the built-in sun entity.',
      },
      da: {
        title: 'Døgnrytmelys styret af solens højde',
        summary: 'Hver halve time, og hver gang en lampe tændes, følger farvetemperaturen solen: koldt lys midt på dagen og varmt i skumringen. Slukkede lamper bliver ikke rørt.',
        trigger: 'Hver halve time, eller når en lampe har været tændt i fem sekunder.',
        conditions: 'Ingen i triggeren. I løkken bliver kun lamper, der allerede er tændt, ændret.',
        actions: 'Omsæt solens højde til 2200–6500 K, og sæt den farvetemperatur på hver tændt lampe.',
        needs: 'Lamper med justerbar farvetemperatur (hos mig WiZ) og den indbyggede sol-entitet.',
      },
      de: {
        title: 'Zirkadianes Licht nach dem Sonnenstand',
        summary: 'Alle 30 Minuten und jedes Mal, wenn eine Lampe angeht, folgt die Farbtemperatur der Sonne: kühl am Mittag, warm in der Dämmerung. Ausgeschaltete Lampen bleiben aus.',
        trigger: 'Alle 30 Minuten, oder eine Lampe ist seit fünf Sekunden an.',
        conditions: 'Keine im Auslöser. In der Schleife werden nur Lampen angefasst, die schon an sind.',
        actions: 'Sonnenstand in 2200 bis 6500 K umrechnen und diese Farbtemperatur an jeder eingeschalteten Lampe setzen.',
        needs: 'Lampen mit einstellbarer Farbtemperatur (bei mir WiZ) und die eingebaute Sonnen-Entität.',
      },
    },
  },
  {
    id: 'tado-presence-setback',
    post: 'tado-home-assistant-dashboard',
    yaml: [
      {
        caption: { en: 'Two automations', da: 'To automationer', de: 'Zwei Automatisierungen' },
        code: `- alias: Tado — Away setback
  trigger:
    - platform: state
      entity_id: group.household_members
      to: not_home
  action:
    - action: climate.set_temperature
      target:
        entity_id:
          - climate.zone_living_room
          - climate.zone_bedroom
          - climate.zone_office
      data:
        temperature: 17

- alias: Tado — Restore on return
  trigger:
    - platform: state
      entity_id: group.household_members
      to: home
  action:
    - action: climate.set_hvac_mode
      target:
        entity_id:
          - climate.zone_living_room
          - climate.zone_bedroom
          - climate.zone_office
      data:
        hvac_mode: auto`,
      },
    ],
    text: {
      en: {
        title: 'Heating down to 17 °C when everyone is out',
        summary: 'Drops every Tado zone to 17 °C when the last person leaves and hands control back to Tado’s own schedule when the first one comes home. The presence comes from your own logic, not from Tado’s geofencing.',
        trigger: 'The household group changes to not_home, or back to home.',
        conditions: 'None.',
        actions: 'Away: set every zone to 17 °C. Home: set every zone back to auto.',
        needs: 'The Tado integration, one climate entity per zone and a group or person entity that shows who is home.',
      },
      da: {
        title: 'Varmen går ned på 17 grader, når alle er ude',
        summary: 'Alle Tado-zoner går ned på 17 grader, når den sidste forlader huset, og Tados eget skema overtager igen, når den første kommer hjem. Tilstedeværelsen kommer fra din egen opsætning og ikke fra Tados geofencing.',
        trigger: 'Husstandsgruppen skifter til not_home eller tilbage til home.',
        conditions: 'Ingen.',
        actions: 'Ude: sæt alle zoner til 17 grader. Hjemme: sæt alle zoner tilbage til auto.',
        needs: 'Tado-integrationen, én klima-entitet pr. zone og en gruppe eller person-entitet, der viser, hvem der er hjemme.',
      },
      de: {
        title: 'Heizung auf 17 °C, wenn niemand zu Hause ist',
        summary: 'Sobald die letzte Person geht, fallen alle Tado-Zonen auf 17 °C. Kommt die erste zurück, gilt wieder Tados eigener Zeitplan. Die Anwesenheit kommt aus deiner eigenen Logik, nicht aus dem Tado-Geofencing.',
        trigger: 'Die Haushaltsgruppe wechselt auf not_home oder zurück auf home.',
        conditions: 'Keine.',
        actions: 'Außer Haus: alle Zonen auf 17 °C. Zurück: alle Zonen wieder auf auto.',
        needs: 'Die Tado-Integration, eine Klima-Entität pro Zone und eine Gruppe oder Person-Entität, die zeigt, wer zu Hause ist.',
      },
    },
  },
  {
    id: 'tado-open-window-alert',
    post: 'tado-home-assistant-dashboard',
    yaml: [
      {
        caption: { en: 'Automation', da: 'Automation', de: 'Automatisierung' },
        code: `alias: Tado — Open window alert
trigger:
  - platform: state
    entity_id:
      - binary_sensor.zone_living_room_window
      - binary_sensor.zone_bathroom_window
    to: "on"
    for:
      minutes: 20
condition:
  - condition: template
    value_template: >
      {{ state_attr(trigger.entity_id | replace('binary_sensor.', 'climate.') | replace('_window', ''), 'hvac_action') == 'heating' }}
action:
  - action: notify.all_devices
    data:
      title: "Window open — heating running"
      message: >
        {{ trigger.entity_id
           | replace('binary_sensor.zone_', '')
           | replace('_window', '')
           | replace('_', ' ')
           | title }} has been open for 20 minutes.`,
      },
    ],
    text: {
      en: {
        title: 'Alert when a window is open and the heating runs',
        summary: 'Sends a push when a window has been open for 20 minutes and the zone is still heating. It catches the window nobody closed, and costs nothing to run.',
        trigger: 'A window sensor has been on for 20 minutes.',
        conditions: 'The matching climate entity reports hvac_action heating.',
        actions: 'Send a push with the room name, taken from the entity ID.',
        needs: 'Tado window sensors named binary_sensor.zone_<room>_window, matching climate.zone_<room> entities and a notify service.',
      },
      da: {
        title: 'Besked, når et vindue står åbent, og varmen kører',
        summary: 'Du får en push, når et vindue har stået åbent i tyve minutter, og zonen stadig varmer. Den fanger vinduet, ingen fik lukket, og koster ingenting at have kørende.',
        trigger: 'En vinduessensor har været tændt i tyve minutter.',
        conditions: 'Den tilhørende klima-entitet melder hvac_action heating.',
        actions: 'Send en push med rummets navn, hentet fra entitets-ID’et.',
        needs: 'Tado-vinduessensorer med navne som binary_sensor.zone_<rum>_window, tilsvarende climate.zone_<rum>-entiteter og en notify-tjeneste.',
      },
      de: {
        title: 'Warnung bei offenem Fenster und laufender Heizung',
        summary: 'Du bekommst eine Push-Nachricht, wenn ein Fenster seit zwanzig Minuten offen steht und die Zone noch heizt. So fällt das Fenster auf, das keiner zugemacht hat. Laufende Kosten: keine.',
        trigger: 'Ein Fenstersensor ist seit zwanzig Minuten an.',
        conditions: 'Die passende Klima-Entität meldet hvac_action heating.',
        actions: 'Push mit dem Raumnamen senden, abgeleitet aus der Entity-ID.',
        needs: 'Tado-Fenstersensoren mit Namen wie binary_sensor.zone_<raum>_window, passende climate.zone_<raum>-Entitäten und ein Notify-Dienst.',
      },
    },
  },
  {
    id: 'vacuum-leave-and-return',
    post: 'roborock-interactive-map-ha',
    yaml: [
      {
        caption: { en: 'Two automations', da: 'To automationer', de: 'Zwei Automatisierungen' },
        code: `- alias: Vacuum — Clean on departure
  trigger:
    - platform: state
      entity_id: person.your_name
      to: not_home
      for:
        minutes: 5
  condition:
    - condition: time
      after: "09:00:00"
      before: "18:00:00"
    - condition: state
      entity_id: vacuum.your_vacuum
      state: docked
  action:
    - action: vacuum.start
      target:
        entity_id: vacuum.your_vacuum

- alias: Vacuum — Dock on return
  trigger:
    - platform: state
      entity_id: person.your_name
      to: home
  condition:
    - condition: state
      entity_id: vacuum.your_vacuum
      state: cleaning
  action:
    - action: vacuum.return_to_base
      target:
        entity_id: vacuum.your_vacuum`,
      },
    ],
    text: {
      en: {
        title: 'Vacuum when you leave, dock when you return',
        summary: 'The vacuum starts five minutes after you leave and goes back to the dock when you come home. The five minutes filter out GPS blips, so it never starts because your phone lost signal for a moment.',
        trigger: 'The person entity is not_home for five minutes, or changes to home.',
        conditions: 'Start: between 09:00 and 18:00 and the vacuum is docked. Dock: the vacuum is cleaning.',
        actions: 'Start the vacuum, or send it back to base.',
        needs: 'Any vacuum entity (Roborock in my setup) and the Companion app for presence.',
      },
      da: {
        title: 'Støvsugeren kører, når du går, og er hjemme, når du kommer',
        summary: 'Robotten starter fem minutter efter, du er gået, og kører tilbage til dokken, når du kommer hjem. De fem minutter fanger GPS-hop, så den ikke starter, bare fordi telefonen mistede signalet et øjeblik.',
        trigger: 'Person-entiteten har været not_home i fem minutter, eller skifter til home.',
        conditions: 'Start: mellem kl. 09.00 og 18.00, og støvsugeren står i dokken. Dok: støvsugeren er i gang.',
        actions: 'Start støvsugeren, eller send den tilbage til dokken.',
        needs: 'En vilkårlig støvsuger-entitet (hos mig en Roborock) og Companion-appen til tilstedeværelse.',
      },
      de: {
        title: 'Saugroboter startet beim Gehen und dockt beim Heimkommen an',
        summary: 'Der Roboter fährt fünf Minuten nach deinem Weggang los und kehrt zur Station zurück, sobald du wieder da bist. Die fünf Minuten fangen GPS-Aussetzer ab, damit er nicht losfährt, nur weil das Handy kurz kein Signal hatte.',
        trigger: 'Die Person-Entität ist fünf Minuten lang not_home, oder sie wechselt auf home.',
        conditions: 'Start: zwischen 9 und 18 Uhr, und der Roboter steht in der Station. Andocken: der Roboter saugt gerade.',
        actions: 'Roboter starten, oder zurück zur Station schicken.',
        needs: 'Eine beliebige Staubsauger-Entität (bei mir ein Roborock) und die Companion-App für die Anwesenheit.',
      },
    },
  },
  {
    id: 'mailbox-delivery',
    post: 'mailboxguard-lora-home-assistant',
    yaml: [
      {
        caption: { en: 'Automation', da: 'Automation', de: 'Automatisierung' },
        code: `alias: Mailbox — Notify on delivery
trigger:
  - platform: state
    entity_id: binary_sensor.mailboxguard
    from: "off"
    to: "on"
action:
  - action: notify.all_devices
    data:
      title: "Mail in the mailbox"
      message: "Something was delivered."`,
      },
    ],
    text: {
      en: {
        title: 'Push notification when the mailbox opens',
        summary: 'Every phone gets a push when the mailbox door opens. A reed switch only knows open or closed, so there are no false alarms.',
        trigger: 'The mailbox sensor changes from off to on.',
        conditions: 'None.',
        actions: 'Send a notification to the notify group.',
        needs: 'A LoRa mailbox sensor (a MailBoxGuard in my setup) and a notify group for your phones.',
      },
      da: {
        title: 'Push, når postkassen åbnes',
        summary: 'Alle telefoner får en besked, når lugen i postkassen går op. En reed-kontakt kender kun åben eller lukket, så der kommer aldrig falske alarmer.',
        trigger: 'Postkassesensoren skifter fra off til on.',
        conditions: 'Ingen.',
        actions: 'Send en besked til notify-gruppen.',
        needs: 'En LoRa-sensor til postkassen (hos mig en MailBoxGuard) og en notify-gruppe med jeres telefoner.',
      },
      de: {
        title: 'Push-Nachricht, wenn der Briefkasten aufgeht',
        summary: 'Alle Handys bekommen eine Nachricht, sobald die Briefkastenklappe aufgeht. Ein Reedkontakt kennt nur offen oder zu, Fehlalarme gibt es deshalb nicht.',
        trigger: 'Der Briefkastensensor wechselt von off auf on.',
        conditions: 'Keine.',
        actions: 'Eine Benachrichtigung an die Notify-Gruppe schicken.',
        needs: 'Ein LoRa-Briefkastensensor (bei mir ein MailBoxGuard) und eine Notify-Gruppe für eure Handys.',
      },
    },
  },
  {
    id: 'tv-living-room-lights',
    post: 'wiz-movie-lights',
    yaml: [
      {
        caption: { en: 'Automation', da: 'Automation', de: 'Automatisierung' },
        code: `alias: Living room lights follow the TV
mode: restart
trigger:
  - platform: state
    entity_id: media_player.living_room_tv
    to: playing
    id: playing
  - platform: state
    entity_id: media_player.living_room_tv
    to: paused
    id: paused
  - platform: state
    entity_id: media_player.living_room_tv
    to: [idle, "off"]
    id: stopped
condition:
  - condition: time
    after: "18:00:00"
action:
  - choose:
      - conditions:
          - condition: trigger
            id: playing
        sequence:
          - action: light.turn_off
            target:
              entity_id:
                - light.ceiling_1
                - light.ceiling_2
          - action: light.turn_on
            target:
              entity_id:
                - light.accent_1
                - light.accent_2
            data:
              brightness_pct: 15
              color_temp_kelvin: 2200
      - conditions:
          - condition: trigger
            id: [paused, stopped]
        sequence:
          - action: light.turn_on
            target:
              entity_id:
                - light.ceiling_1
                - light.ceiling_2
                - light.accent_1
                - light.accent_2
            data:
              brightness_pct: 100
              color_temp_kelvin: 4000`,
      },
    ],
    text: {
      en: {
        title: 'Living room lights follow the TV',
        summary: 'When a film starts, the ceiling lights go off and the accent lights drop to 15 %. Pause or switch off and everything returns to full brightness. No scene button and no voice command.',
        trigger: 'The TV media player changes to playing, paused, or idle/off.',
        conditions: 'The time is after 18:00.',
        actions: 'Playing: ceiling lights off, accent lights at 15 % and 2200 K. Paused or off: all lights at 100 % and 4000 K.',
        needs: 'A media player entity for the TV (the Android TV integration in my setup) and lights with colour temperature. Mode restart stops a quick pause and play from flashing the room.',
      },
      da: {
        title: 'Stuelyset følger TV’et',
        summary: 'Når filmen starter, slukker loftlamperne, og hjørnelamperne går ned på 15 procent. Sæt den på pause eller sluk, så er der fuld lys igen. Ingen sceneknap og ingen stemmekommando.',
        trigger: 'TV’ets media player skifter til playing, paused eller idle/off.',
        conditions: 'Klokken er over 18.00.',
        actions: 'Playing: loftlamper slukket, hjørnelamper på 15 procent og 2200 K. Paused eller slukket: alle lamper på 100 procent og 4000 K.',
        needs: 'En media player-entitet til TV’et (hos mig Android TV-integrationen) og lamper med farvetemperatur. Mode restart sørger for, at en hurtig pause og play ikke giver et lysglimt.',
      },
      de: {
        title: 'Wohnzimmerlicht folgt dem Fernseher',
        summary: 'Beginnt ein Film, gehen die Deckenlampen aus, und die Akzentlampen fallen auf 15 Prozent. Bei Pause oder Aus kommt das volle Licht zurück. Kein Szenenknopf, kein Sprachbefehl.',
        trigger: 'Der Media Player des Fernsehers wechselt auf playing, paused oder idle/off.',
        conditions: 'Es ist nach 18 Uhr.',
        actions: 'Playing: Deckenlampen aus, Akzentlampen auf 15 Prozent und 2200 K. Pause oder aus: alle Lampen auf 100 Prozent und 4000 K.',
        needs: 'Eine Media-Player-Entität für den Fernseher (bei mir die Android-TV-Integration) und Lampen mit Farbtemperatur. Mode restart verhindert ein Aufblitzen bei kurzem Pause und Play.',
      },
    },
  },
  {
    id: 'dishwasher-cheapest-hour',
    post: 'ha-appliances-dashboard',
    yaml: [
      {
        caption: { en: 'Script, started from a dashboard button', da: 'Script, startet fra en dashboard-knap', de: 'Skript, gestartet über eine Dashboard-Schaltfläche' },
        code: `alias: Dishwasher — Schedule cheapest hour
sequence:
  - variables:
      prices: "{{ state_attr('sensor.energi_data_service', 'raw_today') | default([]) }}"
      now_h: "{{ now().hour }}"
      duration_h: 2
      best_hour: >
        {% set ns = namespace(hour=none, price=999) %}
        {% for h in prices %}
          {% if as_datetime(h.hour).hour >= now_h | int and h.price < ns.price %}
            {% set ns.price = h.price %}
            {% set ns.hour = h.hour %}
          {% endif %}
        {% endfor %}
        {{ ns.hour }}
  - action: select.select_option
    target:
      entity_id: select.dishwasher_finish_at
    data:
      option: >
        {{ (as_datetime(best_hour) + timedelta(hours=duration_h)).strftime('%H:%M') }}
  - action: button.press
    target:
      entity_id: button.dishwasher_start`,
      },
    ],
    text: {
      en: {
        title: 'Run the dishwasher in the cheapest hour',
        summary: 'One script finds the cheapest remaining hour in today’s spot prices, sets the finish time to match and starts the machine. On a typical Danish weekday that is worth one to two kroner per wash.',
        trigger: 'None. You start the script from a dashboard button once the machine is loaded.',
        conditions: 'None. Only hours from now onwards are considered.',
        actions: 'Read today’s prices, pick the cheapest hour, add the programme length, set the finish time and press start.',
        needs: 'Energi Data Service (HACS) and a connected dishwasher with a finish-time select and a start button. Remote start must be enabled on the machine itself.',
      },
      da: {
        title: 'Opvaskemaskinen kører i den billigste time',
        summary: 'Ét script finder den billigste time, der er tilbage i dagens spotpriser, sætter sluttidspunktet og starter maskinen. På en almindelig hverdag i Danmark er det en eller to kroner pr. vask.',
        trigger: 'Ingen. Du starter scriptet fra en knap på dashboardet, når maskinen er fyldt.',
        conditions: 'Ingen. Kun timer fra nu og frem bliver talt med.',
        actions: 'Hent dagens priser, vælg den billigste time, læg programmets varighed til, sæt sluttidspunktet og tryk start.',
        needs: 'Energi Data Service (HACS) og en tilsluttet opvaskemaskine med en select til sluttidspunkt og en startknap. Fjernstart skal være slået til på selve maskinen.',
      },
      de: {
        title: 'Geschirrspüler läuft in der günstigsten Stunde',
        summary: 'Ein Skript sucht die günstigste verbleibende Stunde in den heutigen Spotpreisen, stellt die Endzeit passend ein und startet die Maschine. An einem normalen dänischen Werktag sind das ein bis zwei Kronen pro Spülgang.',
        trigger: 'Keiner. Du startest das Skript über eine Schaltfläche im Dashboard, sobald die Maschine voll ist.',
        conditions: 'Keine. Berücksichtigt werden nur Stunden ab jetzt.',
        actions: 'Heutige Preise lesen, günstigste Stunde wählen, Programmdauer addieren, Endzeit setzen und Start drücken.',
        needs: 'Energi Data Service (HACS) und ein vernetzter Geschirrspüler mit Endzeit-Auswahl und Startknopf. Der Fernstart muss an der Maschine selbst aktiviert sein.',
      },
    },
  },
  {
    id: 'shopping-list-store-push',
    post: 'etilbudsavis-shopping-list',
    yaml: [
      {
        caption: { en: 'Automation, two stores shown', da: 'Automation, to butikker vist', de: 'Automatisierung, zwei Geschäfte gezeigt' },
        code: `alias: Shopping list — Push at the store
trigger:
  - platform: zone
    entity_id:
      - device_tracker.phone_1
      - device_tracker.phone_2
    zone: zone.supermarket_a
    event: enter
  - platform: zone
    entity_id:
      - device_tracker.phone_1
      - device_tracker.phone_2
    zone: zone.supermarket_b
    event: enter
variables:
  store_lookup:
    zone.supermarket_a: "Supermarket A"
    zone.supermarket_b: "Supermarket B"
  store_name: "{{ store_lookup[trigger.zone.entity_id] | default('') }}"
action:
  - action: todo.get_items
    target:
      entity_id: todo.shopping_list
    data:
      status: needs_action
    response_variable: todo_result
  - variables:
      found: >
        {% set ns = namespace(items=[]) %}
        {% for item in todo_result['todo.shopping_list']['items'] | default([]) %}
          {% if store_name != '' and item.description | default('') | regex_match(store_name) %}
            {% set ns.items = ns.items + [item.summary] %}
          {% endif %}
        {% endfor %}
        {{ ns.items }}
  - condition: template
    value_template: "{{ found | count > 0 }}"
  - action: notify.all_devices
    data:
      title: "{{ store_name }}: {{ found | count }} item(s) on the list"
      message: "{{ found | join('\\n') }}"`,
      },
    ],
    text: {
      en: {
        title: 'Push the shopping list when you reach the store',
        summary: 'When a phone enters a store zone, the automation reads the shopping list and pushes the items for that store. It stays quiet if nothing on the list belongs there.',
        trigger: 'A phone enters one of the store zones.',
        conditions: 'At least one open list item has a description that starts with the store name.',
        actions: 'Look up the store name, fetch the open items, filter them by store and send a push with the list.',
        needs: 'The eTilbudsavis integration with the patched todo.py from the post, one zone per store and the Companion app. Any to-do list works if the store name sits in the description.',
      },
      da: {
        title: 'Indkøbslisten som push, når du når butikken',
        summary: 'Når en telefon kommer ind i en butikszone, læser automationen indkøbslisten og sender varerne til netop den butik. Er der intet på listen, der hører til, sker der ingenting.',
        trigger: 'En telefon kommer ind i en af butikszonerne.',
        conditions: 'Mindst én åben vare på listen har en beskrivelse, der starter med butikkens navn.',
        actions: 'Slå butiksnavnet op, hent de åbne varer, filtrér på butik og send en push med listen.',
        needs: 'eTilbudsavis-integrationen med den rettede todo.py fra indlægget, én zone pr. butik og Companion-appen. Enhver todo-liste duer, hvis butiksnavnet står i beskrivelsen.',
      },
      de: {
        title: 'Einkaufsliste als Push, sobald du im Geschäft bist',
        summary: 'Betritt ein Handy eine Geschäftszone, liest die Automatisierung die Einkaufsliste und schickt dir die Artikel für genau dieses Geschäft. Gehört nichts auf der Liste dorthin, bleibt es still.',
        trigger: 'Ein Handy betritt eine der Geschäftszonen.',
        conditions: 'Mindestens ein offener Eintrag hat eine Beschreibung, die mit dem Geschäftsnamen beginnt.',
        actions: 'Geschäftsnamen nachschlagen, offene Einträge holen, nach Geschäft filtern und die Liste als Push senden.',
        needs: 'Die eTilbudsavis-Integration mit der angepassten todo.py aus dem Beitrag, eine Zone pro Geschäft und die Companion-App. Jede To-do-Liste funktioniert, wenn der Geschäftsname in der Beschreibung steht.',
      },
    },
  },
  {
    id: 'morning-briefing',
    post: 'ha-morning-briefing-tts',
    yaml: [
      {
        caption: { en: 'Automation, trimmed version', da: 'Automation, forkortet udgave', de: 'Automatisierung, gekürzte Fassung' },
        code: `alias: Morning briefing — spoken at 06:00
mode: single
trigger:
  - platform: time
    at: "06:00:00"
action:
  - action: calendar.get_events
    target:
      entity_id: calendar.family
    data:
      start_date_time: "{{ today_at('00:00') }}"
      end_date_time: "{{ today_at('23:59') }}"
    response_variable: calendar_result
  - action: tts.speak
    target:
      entity_id: tts.your_tts_engine
    data:
      media_player_entity_id: media_player.kitchen_speaker
      language: en-US   # change language and message text to your own
      message: >-
        {% set events = calendar_result['calendar.family']['events'] %}
        {% set temp = state_attr('weather.forecast_home', 'temperature') %}
        {% set waste_days = states('sensor.next_waste_collection') | int(99) %}
        {% set price = states('sensor.energi_data_service') | float(0) | round(2) %}
        Good morning. It is {{ now().strftime('%A') }}.
        The temperature outside is {{ temp }} degrees.
        {% if events | length > 0 %}
        You have {{ events | length }} appointment(s) today:
        {% for event in events %}{{ event.summary }}{% if not loop.last %}, {% endif %}{% endfor %}.
        {% else %}Nothing in the calendar today.
        {% endif %}
        {% if waste_days <= 1 %}The bins are collected today.
        {% elif waste_days == 2 %}The bins are collected tomorrow.
        {% endif %}
        The electricity price is {{ price }} kroner per kilowatt hour.`,
      },
    ],
    text: {
      en: {
        title: 'Spoken morning briefing at 06:00',
        summary: 'Reads out the weather, today’s calendar, waste collection and the electricity price on a kitchen speaker. This is a trimmed version of the one I run, which also covers traffic and the car.',
        trigger: 'The time is 06:00.',
        conditions: 'None. Add a weekday condition if you want quiet weekends.',
        actions: 'Fetch today’s events, build the text in a template and speak it with tts.speak.',
        needs: 'A calendar, a weather entity, a TTS engine and a media player. The waste and price sensors are optional, so cut those lines if you have none.',
      },
      da: {
        title: 'Morgenbriefing, der bliver læst højt kl. 06.00',
        summary: 'Højttaleren i køkkenet læser vejret, dagens kalender, affaldsafhentning og elprisen op. Den her er en forkortet udgave. Min egen læser også trafikken og bilens ladestatus op.',
        trigger: 'Klokken er 06.00.',
        conditions: 'Ingen. Tilføj en ugedagsbetingelse, hvis weekenderne skal være stille.',
        actions: 'Hent dagens aftaler, byg teksten i en skabelon og læs den op med tts.speak.',
        needs: 'En kalender, en vejr-entitet, en TTS-motor og en media player. Affalds- og prissensorerne er valgfri, så fjern de linjer, hvis du ikke har dem.',
      },
      de: {
        title: 'Gesprochenes Morgenbriefing um 6 Uhr',
        summary: 'Der Lautsprecher in der Küche liest Wetter, Tageskalender, Müllabfuhr und Strompreis vor. Das ist eine gekürzte Fassung meiner eigenen, die zusätzlich den Verkehr und das Auto ansagt.',
        trigger: 'Es ist 6 Uhr.',
        conditions: 'Keine. Mit einer Wochentag-Bedingung bleiben die Wochenenden ruhig.',
        actions: 'Heutige Termine holen, den Text in einem Template bauen und mit tts.speak vorlesen.',
        needs: 'Ein Kalender, eine Wetter-Entität, eine TTS-Engine und ein Media Player. Müll- und Preissensor sind optional, streich die Zeilen, wenn du sie nicht hast.',
      },
    },
  },
];
