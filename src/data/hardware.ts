import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;

export interface HardwareItem {
  name: string;
  icon: string;
  link: string | null;
  text: L;
}

export interface HardwareGroup {
  id: string;
  title: L;
  items: HardwareItem[];
}

// The Hardware Lab on the front page. Checked against live Home Assistant on 2026-11-05.
export const hardwareGroups: HardwareGroup[] = [
  {
    id: 'infra',
    title: { en: 'Server and network', da: 'Server og netværk', de: 'Server und Netzwerk' },
    items: [
      {
        name: 'Dell OptiPlex 7060',
        icon: 'hard-drives',
        link: null,
        text: {
          en: 'The Proxmox host. Home Assistant runs on it as a virtual machine.',
          da: 'Proxmox-værten. Home Assistant kører på den som virtuel maskine.',
          de: 'Der Proxmox-Host. Home Assistant läuft darauf als virtuelle Maschine.',
        },
      },
      {
        name: 'JetKVM Mini',
        icon: 'terminal-window',
        link: 'https://jetkvm.com',
        text: {
          en: 'KVM over IP on the OptiPlex. BIOS and boot screens in a browser, for the times SSH is no help.',
          da: 'KVM over IP på OptiPlexen. BIOS og opstartsskærme i browseren, til de gange hvor SSH ikke rækker.',
          de: 'KVM over IP am OptiPlex. BIOS und Bootbildschirme im Browser, für die Fälle, in denen SSH nicht weiterhilft.',
        },
      },
      {
        name: 'Home Assistant OS',
        icon: 'house-line',
        link: 'https://www.home-assistant.io',
        text: {
          en: 'The hub for everything on this list, with the automations and dashboards.',
          da: 'Samlepunktet for alt på listen, med automationerne og dashboards.',
          de: 'Die Zentrale für alles auf dieser Liste, mit den Automatisierungen und Dashboards.',
        },
      },
      {
        name: 'Home Assistant Connect ZBT-2',
        icon: 'broadcast',
        link: 'https://www.home-assistant.io/connectzbt2',
        text: {
          en: 'USB radio running as a Thread border router, so Thread sensors pair directly with Home Assistant.',
          da: 'USB-radio, der kører som Thread Border Router, så Thread-sensorer parres direkte med Home Assistant.',
          de: 'USB-Funkstick als Thread Border Router, damit sich Thread-Sensoren direkt mit Home Assistant koppeln.',
        },
      },
      {
        name: 'UniFi',
        icon: 'network',
        link: 'https://ui.com',
        text: {
          en: 'An Ultra gateway, an 8-port switch with 4 PoE ports, two access points and a separate IoT network.',
          da: 'En Ultra-gateway, en switch med 8 porte og 4 PoE, to access points og et særskilt IoT-net.',
          de: 'Ein Ultra-Gateway, ein 8-Port-Switch mit 4 PoE-Ports, zwei Access Points und ein eigenes IoT-Netz.',
        },
      },
    ],
  },
  {
    id: 'outdoor',
    title: { en: 'House and garden', da: 'Hus og have', de: 'Haus und Garten' },
    items: [
      {
        name: 'Reolink CX810',
        icon: 'security-camera',
        link: 'https://reolink.com',
        text: {
          en: '4K PoE camera that tells people, vehicles and animals apart. Alerts go to my phone and the TV.',
          da: '4K PoE-kamera, der skelner mellem personer, biler og dyr. Beskederne går til telefonen og tv\'et.',
          de: '4K-PoE-Kamera, die Personen, Fahrzeuge und Tiere unterscheidet. Meldungen gehen ans Handy und an den Fernseher.',
        },
      },
      {
        name: 'Roborock Q5 Pro',
        icon: 'robot',
        link: 'https://www.roborock.com',
        text: {
          en: 'Interactive floor map with room-by-room cleaning, built on xiaomi-vacuum-map-card.',
          da: 'Interaktivt kort med rengøring rum for rum, bygget på xiaomi-vacuum-map-card.',
          de: 'Interaktive Karte mit Reinigung Raum für Raum, gebaut mit xiaomi-vacuum-map-card.',
        },
      },
      {
        name: 'Mammotion LUBA mini AWD',
        icon: 'plant',
        link: 'https://mammotion.com',
        text: {
          en: 'Mows by GPS and RTK without a boundary wire and takes the weather into account. Stored away for winter.',
          da: 'Klipper efter GPS og RTK uden kantkabel og tager hensyn til vejret. Står i vinteropbevaring.',
          de: 'Mäht per GPS und RTK ohne Begrenzungskabel und berücksichtigt das Wetter. Überwintert eingelagert.',
        },
      },
      {
        name: 'MailBoxGuard',
        icon: 'envelope-simple',
        link: 'https://github.com/PricelessToolkit/MailBoxGuard',
        text: {
          en: 'LoRa sensor in the mailbox, 200 metres from the house. A message when post arrives.',
          da: 'LoRa-sensor i postkassen 200 meter fra huset. Besked, når der kommer post.',
          de: 'LoRa-Sensor im Briefkasten, 200 Meter vom Haus. Eine Nachricht, wenn Post kommt.',
        },
      },
    ],
  },
  {
    id: 'climate',
    title: { en: 'Car and climate', da: 'Bil og klima', de: 'Auto und Klima' },
    items: [
      {
        name: 'Škoda Elroq',
        icon: 'car-profile',
        link: null,
        text: {
          en: 'Connected through VW Group Connect: battery, charging, range and a price for every trip.',
          da: 'Koblet på via VW Group Connect: batteri, opladning, rækkevidde og en pris for hver tur.',
          de: 'Über VW Group Connect angebunden: Akku, Laden, Reichweite und ein Preis für jede Fahrt.',
        },
      },
      {
        name: 'Tado',
        icon: 'thermometer-simple',
        link: 'https://www.tado.com',
        text: {
          en: 'Controls the air-to-air heat pump in the living room: one zone, with the API quota handled by Tado Hijack.',
          da: 'Styrer luft-til-luft-varmepumpen i stuen: én zone, hvor Tado Hijack holder styr på API-kvoten.',
          de: 'Steuert die Luft-Luft-Wärmepumpe im Wohnzimmer: eine Zone, das API-Kontingent verwaltet Tado Hijack.',
        },
      },
      {
        name: 'Mill',
        icon: 'fire-simple',
        link: 'https://www.millnorway.com',
        text: {
          en: 'Wi-Fi panel heaters with temperature set per room and no gateway.',
          da: 'Wi-Fi-panelradiatorer med temperatur pr. rum og uden gateway.',
          de: 'WLAN-Paneelheizungen mit Temperatur pro Raum, ohne Gateway.',
        },
      },
      {
        name: 'Fresh Intellivent Sky',
        icon: 'fan',
        link: 'https://www.fresh.dk',
        text: {
          en: 'Bathroom fans that react to humidity, connected over Bluetooth through a community integration.',
          da: 'Badeværelsesventilatorer, der reagerer på fugt, koblet på over Bluetooth via en community-integration.',
          de: 'Badlüfter, die auf Feuchtigkeit reagieren, über Bluetooth per Community-Integration angebunden.',
        },
      },
    ],
  },
  {
    id: 'light',
    title: { en: 'Light and sound', da: 'Lys og lyd', de: 'Licht und Ton' },
    items: [
      {
        name: 'WiZ',
        icon: 'lightbulb',
        link: 'https://www.wizconnected.com',
        text: {
          en: 'Wi-Fi bulbs in the living room, with circadian lighting and film lighting that follows the TV.',
          da: 'Wi-Fi-pærer i stuen med døgnrytmelys og filmlys, der følger tv\'et.',
          de: 'WLAN-Lampen im Wohnzimmer mit zirkadianem Licht und Filmlicht, das dem Fernseher folgt.',
        },
      },
      {
        name: 'LEDVANCE',
        icon: 'plug',
        link: 'https://www.ledvance.com',
        text: {
          en: 'Three outdoor Matter plugs that run the garden string lights, locally and without a hub.',
          da: 'Tre udendørsstik på Matter, der styrer lyskæderne i haven lokalt og uden hub.',
          de: 'Drei Matter-Außensteckdosen, die die Lichterketten im Garten lokal und ohne Hub schalten.',
        },
      },
      {
        name: 'Govee',
        icon: 'sparkle',
        link: 'https://www.govee.com',
        text: {
          en: 'Flood lights, ground lights and a string of bulbs outdoors, through the Govee integration and Govee to MQTT.',
          da: 'Projektører, jordspyd og en lyskæde udenfor via Govee-integrationen og Govee to MQTT.',
          de: 'Fluter, Bodenleuchten und eine Lichterkette im Freien, über die Govee-Integration und Govee to MQTT.',
        },
      },
      {
        name: 'Sonos',
        icon: 'speaker-high',
        link: 'https://www.sonos.com',
        text: {
          en: 'A Beam in the living room, tied together with the Nest Audio speakers through Home Assistant scripts.',
          da: 'En Beam i stuen, samlet med Nest Audio-højttalerne via scripts i Home Assistant.',
          de: 'Eine Beam im Wohnzimmer, über Home-Assistant-Skripte mit den Nest-Audio-Lautsprechern verbunden.',
        },
      },
    ],
  },
  {
    id: 'appliances',
    title: { en: 'Appliances and sensors', da: 'Hvidevarer og sensorer', de: 'Haushaltsgeräte und Sensoren' },
    items: [
      {
        name: 'Bosch Home Connect',
        icon: 'drop',
        link: 'https://www.home-connect.com',
        text: {
          en: 'Dishwasher with a push message and a button that puts the programme in the cheapest electricity hour.',
          da: 'Opvaskemaskine med pushbesked og en knap, der lægger programmet i den billigste elpristime.',
          de: 'Geschirrspüler mit Push-Nachricht und einer Taste, die das Programm in die günstigste Strompreisstunde legt.',
        },
      },
      {
        name: 'Miele',
        icon: 'washing-machine',
        link: 'https://www.miele.com',
        text: {
          en: 'Washing machine on the built-in integration. A message when it\'s done, and my own workaround for delayed start.',
          da: 'Vaskemaskine på den indbyggede integration. Besked, når den er færdig, og min egen løsning på forsinket start.',
          de: 'Waschmaschine über die eingebaute Integration. Eine Nachricht, wenn sie fertig ist, und mein eigener Workaround für den Startaufschub.',
        },
      },
      {
        name: 'IKEA MYGGBETT',
        icon: 'door-open',
        link: 'https://www.ikea.com',
        text: {
          en: 'Door and window sensors on Thread that turn the radiator off when a window opens.',
          da: 'Dør- og vinduessensorer på Thread, der slukker radiatoren, når et vindue åbnes.',
          de: 'Tür- und Fenstersensoren über Thread, die die Heizung abschalten, wenn ein Fenster aufgeht.',
        },
      },
      {
        name: 'ESPHome Bluetooth proxy',
        icon: 'cpu',
        link: 'https://esphome.io',
        text: {
          en: 'A XIAO ESP32-C3 on ESPHome that brings the bathroom fans into Home Assistant over Bluetooth, locally.',
          da: 'En XIAO ESP32-C3 med ESPHome, der henter badeværelsesventilatorerne ind i Home Assistant over Bluetooth, lokalt.',
          de: 'Ein XIAO ESP32-C3 mit ESPHome, der die Badlüfter lokal per Bluetooth in Home Assistant bringt.',
        },
      },
    ],
  },
];
