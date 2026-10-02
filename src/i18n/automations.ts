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
];
