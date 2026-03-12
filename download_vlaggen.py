#!/usr/bin/env python3
"""Download flags for all countries and resize to 600px width."""

import json
import os
import requests
from PIL import Image
from io import BytesIO

# Mapping van Nederlandse landnamen naar ISO 3166-1 alpha-2 codes
LAND_NAAR_CODE = {
    "Afghanistan": "af",
    "Albanië": "al",
    "Algerije": "dz",
    "Andorra": "ad",
    "Angola": "ao",
    "Antigua en Barbuda": "ag",
    "Argentinië": "ar",
    "Armenië": "am",
    "Australië": "au",
    "Azerbeidzjan": "az",
    "Bahama's": "bs",
    "Bahrein": "bh",
    "Bangladesh": "bd",
    "Barbados": "bb",
    "Belarus": "by",
    "België": "be",
    "Belize": "bz",
    "Benin": "bj",
    "Bhutan": "bt",
    "Bolivia": "bo",
    "Bosnië en Herzegovina": "ba",
    "Botswana": "bw",
    "Brazilië": "br",
    "Brunei": "bn",
    "Bulgarije": "bg",
    "Burkina Faso": "bf",
    "Burundi": "bi",
    "Cabo Verde": "cv",
    "Cambodja": "kh",
    "Canada": "ca",
    "Centraal-Afrikaanse Republiek": "cf",
    "Chili": "cl",
    "China": "cn",
    "Colombia": "co",
    "Comoren": "km",
    "Congo-Brazzaville": "cg",
    "Congo-Kinshasa": "cd",
    "Costa Rica": "cr",
    "Cuba": "cu",
    "Cyprus": "cy",
    "Denemarken": "dk",
    "Djibouti": "dj",
    "Dominica": "dm",
    "Dominicaanse Republiek": "do",
    "Duitsland": "de",
    "Ecuador": "ec",
    "Egypte": "eg",
    "El Salvador": "sv",
    "Equatoriaal-Guinea": "gq",
    "Eritrea": "er",
    "Estland": "ee",
    "Eswatini": "sz",
    "Ethiopië": "et",
    "Fiji": "fj",
    "Filipijnen": "ph",
    "Finland": "fi",
    "Frankrijk": "fr",
    "Gabon": "ga",
    "Gambia": "gm",
    "Georgië": "ge",
    "Ghana": "gh",
    "Grenada": "gd",
    "Griekenland": "gr",
    "Guatemala": "gt",
    "Guinee": "gn",
    "Guinee-Bissau": "gw",
    "Guyana": "gy",
    "Haïti": "ht",
    "Honduras": "hn",
    "Hongarije": "hu",
    "Ierland": "ie",
    "IJsland": "is",
    "India": "in",
    "Indonesië": "id",
    "Irak": "iq",
    "Iran": "ir",
    "Israël": "il",
    "Italië": "it",
    "Ivoorkust": "ci",
    "Jamaica": "jm",
    "Japan": "jp",
    "Jemen": "ye",
    "Jordanië": "jo",
    "Kameroen": "cm",
    "Kazachstan": "kz",
    "Kenia": "ke",
    "Kirgizië": "kg",
    "Kiribati": "ki",
    "Koeweit": "kw",
    "Kroatië": "hr",
    "Laos": "la",
    "Lesotho": "ls",
    "Letland": "lv",
    "Libanon": "lb",
    "Liberia": "lr",
    "Libië": "ly",
    "Liechtenstein": "li",
    "Litouwen": "lt",
    "Luxemburg": "lu",
    "Madagaskar": "mg",
    "Malawi": "mw",
    "Maldiven": "mv",
    "Maleisië": "my",
    "Mali": "ml",
    "Malta": "mt",
    "Marokko": "ma",
    "Marshalleilanden": "mh",
    "Mauritanië": "mr",
    "Mauritius": "mu",
    "Mexico": "mx",
    "Micronesië": "fm",
    "Moldavië": "md",
    "Monaco": "mc",
    "Mongolië": "mn",
    "Montenegro": "me",
    "Mozambique": "mz",
    "Myanmar": "mm",
    "Namibië": "na",
    "Nauru": "nr",
    "Nederland": "nl",
    "Nepal": "np",
    "Nicaragua": "ni",
    "Nieuw-Zeeland": "nz",
    "Niger": "ne",
    "Nigeria": "ng",
    "Noord-Korea": "kp",
    "Noord-Macedonië": "mk",
    "Noorwegen": "no",
    "Oeganda": "ug",
    "Oekraïne": "ua",
    "Oezbekistan": "uz",
    "Oman": "om",
    "Oostenrijk": "at",
    "Oost-Timor": "tl",
    "Pakistan": "pk",
    "Palau": "pw",
    "Panama": "pa",
    "Papoea-Nieuw-Guinea": "pg",
    "Paraguay": "py",
    "Peru": "pe",
    "Polen": "pl",
    "Portugal": "pt",
    "Qatar": "qa",
    "Roemenië": "ro",
    "Rusland": "ru",
    "Rwanda": "rw",
    "Saint Kitts en Nevis": "kn",
    "Saint Lucia": "lc",
    "Saint Vincent en de Grenadines": "vc",
    "Salomonseilanden": "sb",
    "Samoa": "ws",
    "San Marino": "sm",
    "Sao Tomé en Principe": "st",
    "Saoedi-Arabië": "sa",
    "Senegal": "sn",
    "Servië": "rs",
    "Seychellen": "sc",
    "Sierra Leone": "sl",
    "Singapore": "sg",
    "Slovenië": "si",
    "Slowakije": "sk",
    "Soedan": "sd",
    "Somalië": "so",
    "Spanje": "es",
    "Sri Lanka": "lk",
    "Suriname": "sr",
    "Syrië": "sy",
    "Tadzjikistan": "tj",
    "Tanzania": "tz",
    "Thailand": "th",
    "Togo": "tg",
    "Tonga": "to",
    "Trinidad en Tobago": "tt",
    "Tsjaad": "td",
    "Tsjechië": "cz",
    "Tunesië": "tn",
    "Turkije": "tr",
    "Turkmenistan": "tm",
    "Tuvalu": "tv",
    "Uruguay": "uy",
    "Vanuatu": "vu",
    "Vaticaanstad": "va",
    "Venezuela": "ve",
    "Verenigd Koninkrijk": "gb",
    "Verenigde Arabische Emiraten": "ae",
    "Verenigde Staten": "us",
    "Vietnam": "vn",
    "Zambia": "zm",
    "Zimbabwe": "zw",
    "Zuid-Afrika": "za",
    "Zuid-Korea": "kr",
    "Zuid-Soedan": "ss",
    "Zweden": "se",
    "Zwitserland": "ch",
}

TARGET_WIDTH = 600
FLAGS_DIR = os.path.join(os.path.dirname(__file__), "vlaggen")
# flagcdn.com biedt hoge kwaliteit PNG vlaggen
BASE_URL = "https://flagcdn.com/w1280/{code}.png"

def download_and_resize(land, code):
    url = BASE_URL.format(code=code)
    filename = f"{code}.png"
    filepath = os.path.join(FLAGS_DIR, filename)

    if os.path.exists(filepath):
        print(f"  ✓ {land} ({code}) — al aanwezig, overslaan")
        return True

    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"  ✗ {land} ({code}) — download mislukt: {e}")
        return False

    try:
        img = Image.open(BytesIO(resp.content))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")

        w, h = img.size
        ratio = TARGET_WIDTH / w
        new_h = round(h * ratio)
        img = img.resize((TARGET_WIDTH, new_h), Image.LANCZOS)
        img.save(filepath, "PNG", optimize=True)
        print(f"  ✓ {land} ({code}) — {w}x{h} → {TARGET_WIDTH}x{new_h}")
        return True
    except Exception as e:
        print(f"  ✗ {land} ({code}) — resize mislukt: {e}")
        return False


def main():
    os.makedirs(FLAGS_DIR, exist_ok=True)

    with open(os.path.join(os.path.dirname(__file__), "landen.json"), "r") as f:
        landen = json.load(f)

    print(f"Downloaden en resizen van {len(landen)} vlaggen naar {TARGET_WIDTH}px breed...\n")

    ok = 0
    fail = 0
    for entry in landen:
        land = entry["land"]
        code = LAND_NAAR_CODE.get(land)
        if not code:
            print(f"  ? {land} — geen ISO-code gevonden, overslaan")
            fail += 1
            continue
        if download_and_resize(land, code):
            ok += 1
        else:
            fail += 1

    print(f"\nKlaar! {ok} gelukt, {fail} mislukt.")


if __name__ == "__main__":
    main()
