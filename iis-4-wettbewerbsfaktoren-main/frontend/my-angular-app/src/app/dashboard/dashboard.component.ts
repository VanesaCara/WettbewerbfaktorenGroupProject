import { Component, AfterViewInit, ViewChild,ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-dashboard',
  standalone: true, // Wenn die Komponente Standalone ist
  imports: [CommonModule, FormsModule], // Hier die benötigten Module importieren
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})


export class DashboardComponent implements AfterViewInit{

  map: google.maps.Map | undefined; // Eigenschaft für die Karte
  geocoder: google.maps.Geocoder | undefined; // Eigenschaft für den Geocoder
  placesService: google.maps.places.PlacesService | undefined; //Eigenschaft für den Places Service

  private nearBySupermarkets: google.maps.places.PlaceResult[] = [];
  private supermarketsTemp: google.maps.places.PlaceResult[] = [];

  private location : google.maps.LatLng | undefined;
  private marker: google.maps.Marker | undefined;

  selectedSupermarket: google.maps.places.PlaceResult | null = null;

  circle: google.maps.Circle | undefined; // Variable für den Kreis
  maxRadius: number | undefined; //maximaler Radius

  maxTravelTime: number = 600; // Standardmäßig 10 Minuten (600 Sekunden)
  isRuralArea: boolean = false; // Standardmäßig Stadtmodus

  private distances: {
    name: string;
    distanceKm: number;
    invertedDistance: number;
    weightedDistance: number;
    marketShare: number;
  }[] = []; //Array für die Distanzen

  private aggregatedMarketShares: {
    name: string;
    totalMarketShare: number;
  }[] = [];

  sumOfSquaredMarketShares: number = 0;

  @ViewChild('searchBox') searchBox!: ElementRef;

  //Auswahlmöglichkeiten für den Modus Fahren oder zu Fuß
  travelModes: { [key: string]: boolean } = {
    DRIVING: true,  // Standardmodus
    WALKING: false, // Zu Fuß wird standardmäßig deaktiviert
  };


  // Auswahlmöglichkeiten für eigene Supermärkte (Favoriten)
  textOptions: string[] = [
    'EDEKA Daniels, Holsterhauser Platz, Essen, Deutschland',
    'Hamburg',
    'München',
    'Köln',
    'Frankfurt',
  ];

  // Auswahlmöglichkeiten für Wettbewerber
  selectedBrands: { [key: string]: boolean } = {
    Aldi: false,
    Lidl: false,
    Netto: false,
    REWE: false,
  };

  // Variable für den aktuell ausgewählten Text
  selectedText: string = '';
  errorMessage: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMapsScript();
    }
  }

  loadGoogleMapsScript(): void {
    if (typeof google !== 'undefined') {
      this.initMap();
      return;
    }
  }

  initMap(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 51.1657, lng: 10.4515 }, // Deutschland
      zoom: 6,
    });
    this.initAutocomplete();
  }


  initAutocomplete() {
  // Falls das Input-Feld oder google   nicht da sein sollte, return
  if (!this.searchBox || !google) {
    return;
  }
// Autocomplete für das Input-Feld erzeugen
const autocomplete = new google.maps.places.Autocomplete(this.searchBox.nativeElement, {
  // Optional: bestimmte Autocomplete-Einstellungen
  // types: ['geocode'], // oder ['(cities)'], je nach Bedarf
  componentRestrictions: { country: 'de' }
});

// Event-Listener für place_changed, sobald der User einen Ort ausgewählt hat
autocomplete.addListener('place_changed', () => {
  const place = autocomplete.getPlace();
  this.updateSelectedSupermarket(place);




  if (!place.geometry || !place.geometry.location) {
    console.error('Keine gültige Location gefunden.');
    return;
  }



  this.location = place.geometry.location;

  if (this.marker) {
    this.marker.setPosition(this.location);
  } else {
    // Marker einmalig erzeugen
    this.marker = new google.maps.Marker({
      position: this.location,
      map: this.map!,
      title: place.formatted_address,
    });
  }
  this.map!.setCenter(this.location);
  this.map!.setZoom(20);
});
  }


  updateMarker(): void {

    this.geocoder = new google.maps.Geocoder();

    if (this.selectedText && this.geocoder) {
      this.geocoder.geocode({ address: this.selectedText }, (results, status) => {
        if (status === 'OK' && results) {
          const location = results[0].geometry.location;

          // Debug: Logge die Koordinaten
          console.log('Geocoding location:', location.lat(), location.lng());
          this.errorMessage= `Ort: ${this.selectedText}, Latitude: ${location.lat()}, Longitude: ${location.lng()}`;
          // Karte zentrieren
          this.map!.setCenter(location);
          this.map!.setZoom(10);

          this.location=location; //GLeichsetzen mit der Location der anderen Methode
          // Marker hinzufügen
          new google.maps.Marker({
            position: location,
            map: this.map!,
            title: this.selectedText,
          });
        } else {
          console.error('Geocoding failed:', status);
        }
      });
    } else {
      console.error('Geocoder or Map is not initialized.');
    }
  }


  searchNearbySupermarkets(): void {

    this.nearBySupermarkets = []; // Array leeren

    this.placesService = new google.maps.places.PlacesService(this.map!); //Places Service initialisieren

    if (!this.placesService) {
      console.warn('PlacesService ist nicht initialisiert.');
      return;
    }

    // Alle ausgewählten Marken erfassen
    const selectedKeywords = Object.keys(this.selectedBrands).filter(
      (brand) => this.selectedBrands[brand]
    );

    if (selectedKeywords.length === 0) {
      alert('Bitte wähle mindestens eine Supermarktkette aus.');
      return;
    }

    for (const keyword of selectedKeywords) {

  const request: google.maps.places.PlaceSearchRequest = {
    location: this.location,
    radius: 10000,
    type: 'grocery_or_supermarket',
    keyword: keyword
  };


  this.placesService?.nearbySearch(request, async (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {


      // 1) Ergebnisse in Array speichern und Filtern
      this.supermarketsTemp = results.filter(place => {
        const name = place.name?.toLowerCase() || '';
        return name.includes(keyword.toLowerCase());
      });

      console.log('Aktueller Inhalt von SupermarketsTemp:', this.supermarketsTemp);

      // 2) Supermärkte die innerhalb von 10 Minuten erreichbar sind filtern


      const filteredResults = await Promise.all(
        this.supermarketsTemp.map(async (place) => {
          if (place.geometry && place.geometry.location && this.location) {
            const travelTime = await this.getTravelTimeAsync(this.location, place.geometry.location);
            console.log(`Fahrtzeit für ${place.name} Adresse:${place.vicinity} : ${travelTime} Sekunden`);
            return travelTime !== null && travelTime <= this.maxTravelTime ? place : null;
          }

          return null;
        })
      );


      this.supermarketsTemp = filteredResults.filter(place => place !== null);


      // 2) Temporäres Array dem finalen Array hinzufügen
      this.nearBySupermarkets = this.nearBySupermarkets.concat(this.supermarketsTemp);


      // 3) Optional: Für jeden Treffer einen Marker setzen
      this.nearBySupermarkets.forEach(place => {
        if (!place.geometry || !place.geometry.location) return;

        new google.maps.Marker({
          map: this.map,
          position: place.geometry.location,
          title: place.name
        });

      });


      console.log('Aktueller Inhalt von nearBySupermarkets:', this.nearBySupermarkets);

      this.maxRadius = this.getMaxCompetitorDistance(this.location!,this.nearBySupermarkets); //maximalen Radius berechnen


      // Falls bereits ein Kreis existiert, entferne ihn
      if (this.circle) {
        this.circle.setMap(null);
      }

      // Neuen Kreis um den Markt zeichnen (Radius in Metern)
      this.circle = new google.maps.Circle({
        strokeColor: '#FF0000', // Randfarbe
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000', // Füllfarbe
        fillOpacity: 0.35,
        map: this.map,
        center: this.location,
        radius: this.maxRadius, // 5 km Radius
      });

      //Karte zentral auf den Ort setzen
      if (this.location) {
        this.map?.setCenter(this.location);
        this.map?.setZoom(this.getZoomLevelForRadius(this.maxRadius));
      } else {
        console.error('Fehler: location ist undefined und kann nicht als Kartenmittelpunkt gesetzt werden.');
      }


    } else {
      console.warn('Fehler bei NearbySearch:', status);
    }
  });
}

  }



  getTravelTimeAsync(
    origin: google.maps.LatLng,
    destination: google.maps.LatLng
  ): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const distanceService = new google.maps.DistanceMatrixService();

      const selectedMode = this.travelModes['WALKING'] ? google.maps.TravelMode.WALKING : google.maps.TravelMode.DRIVING; //Wahl des aktivierten Modus

      const request: google.maps.DistanceMatrixRequest = {
        origins: [origin],
        destinations: [destination],
        travelMode: selectedMode,
        unitSystem: google.maps.UnitSystem.METRIC,
      };

      distanceService.getDistanceMatrix(request, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const element = response.rows[0].elements[0];
          if (element.status === google.maps.DistanceMatrixElementStatus.OK && element.duration) {
            resolve(element.duration.value); // Rückgabe der Dauer in Sekunden
          } else {
            console.error('Keine Fahrzeit verfügbar.');
            resolve(null); // Keine Dauer verfügbar
          }
        } else {
          console.error(`DistanceMatrix fehlgeschlagen: ${status}`);
          reject(new Error(`DistanceMatrix fehlgeschlagen: ${status}`)); // Fehler zurückgeben
        }
      });
    });
  }


  calculateHHI(): void {

    if (!this.location) {
      console.warn('Kein gültiger Ausgangs-Standort (this.location) definiert.');
      return;
    }

// Ausgangskoordinaten aus this.location
    const myLat = this.location.lat();
    const myLng = this.location.lng();

    // Array ggf. leeren oder neu befüllen
    this.distances = [];

    for (const place of this.nearBySupermarkets) {
      if (place.geometry?.location) {
        const supermarketLat = place.geometry.location.lat();
        const supermarketLng = place.geometry.location.lng();

        const distance = this.haversineDistance(
          myLat,
          myLng,
          supermarketLat,
          supermarketLng
        );

        // 2) Invertierte Distanz (Beispiel: 1 / km). Für Distanz = 0 => 0 oder Infinity-Check
        let inverted = 0;
        if (distance !== 0) {
          inverted = 1 / distance;
        }

        this.distances.push({
          name: place.name ?? 'Unbekannt',
          distanceKm: distance,
          invertedDistance: inverted,
          weightedDistance: 0,
          marketShare: 0
        });
      }
    }

    // Schritt 2: Summe aller invertierten Distanzen berechnen
    const sumInverted = this.distances.reduce((acc, curr) => acc + curr.invertedDistance, 0);

    // Schritt 3: Für jeden Supermarkt den Anteil (= weightedDistance) am Gesamtsumme berechnen
    this.distances = this.distances.map((d) => {
      // Achtung auf Division durch 0
      const ratio = sumInverted === 0 ? 0 : d.invertedDistance / sumInverted;

      const marketShare = ratio * 100;

      return {
        ...d,
        weightedDistance: ratio,
        marketShare: marketShare
      };
    });


    // Beispiel: Konsolenausgabe, um das Ergebnis zu prüfen
    console.log('Haversine-Distanzen:', this.distances);

    this.aggregateMarketSharesByName();

    this.sumOfSquaredMarketShares = this.aggregatedMarketShares.reduce(
      (acc, item) => acc + Math.pow(item.totalMarketShare, 2),
      0
    );

    console.log('Summe der Quadrate der Marktanteile:', this.sumOfSquaredMarketShares);

  }

// Haversine-Formel zur Berechnung der Luftlinie (in km)
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Erdradius in km

    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const radLat1 = this.toRadians(lat1);
    const radLat2 = this.toRadians(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(radLat1) *
      Math.cos(radLat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Ergebnis in Kilometer
  }

// Hilfsmethode, um Grad in Radianten zu konvertieren
  private toRadians(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private aggregateMarketSharesByName(): void {
    // Schritt 1: Mit reduce() nach name gruppieren
    const grouped = this.distances.reduce<{ [key: string]: number }>(
      (acc, entry) => {
        if (!acc[entry.name]) {
          acc[entry.name] = 0;
        }
        acc[entry.name] += entry.marketShare;
        return acc;
      },
      {}
    );

    // Schritt 2: Objekt in Array transformieren
    this.aggregatedMarketShares = Object.keys(grouped).map((marketName) => {
      return {
        name: marketName,
        totalMarketShare: grouped[marketName],
      };
    });

    console.log('Aggregierte Marketshares:', this.aggregatedMarketShares);
  }


  //Berechnung der Luftlinie zum entferntesten Wettbewerber
  getMaxCompetitorDistance(centerLocation: google.maps.LatLng, nearbySupermarkets: google.maps.places.PlaceResult[]): number {
    if (!centerLocation || !nearbySupermarkets || nearbySupermarkets.length === 0) {
      console.warn('Keine gültigen Supermärkte oder Center-Location vorhanden.');
      return 5000; // Standardradius (5 km), falls keine Daten vorhanden sind.
    }

    let maxDistance = 0;

    nearbySupermarkets.forEach((supermarket) => {
      if (supermarket.geometry && supermarket.geometry.location) {
        const competitorLocation = supermarket.geometry.location;

        // Berechnung der Luftliniendistanz
        const distance = google.maps.geometry.spherical.computeDistanceBetween(centerLocation, competitorLocation);

        if (distance > maxDistance) {
          maxDistance = distance;
        }
      }
    });

    console.log(`Maximale Entfernung zum weitesten Wettbewerber: ${maxDistance} Meter`);

    return maxDistance+200;
  }

  //Zoom automatisch setzen
  getZoomLevelForRadius(radius: number): number {
    if (radius < 500) return 16;  // Weniger als 500m → Sehr nah
    if (radius < 1000) return 15; // 500m - 1km → Nahzoom
    if (radius < 3000) return 14; // 1km - 3km → Leicht weiter
    if (radius < 5000) return 13; // 3km - 5km → Mittlerer Zoom
    if (radius < 10000) return 12; // 5km - 10km → Weiterer Zoom
    if (radius < 20000) return 11; // 10km - 20km → Weitwinkel
    return 10; // Mehr als 20km → Sehr weit rauszoomen
  }

  updateTravelMode(): void {
    // Setze den ausgewählten TravelMode
    this.travelModes['DRIVING'] = !this.travelModes['WALKING']; // Wenn zu Fuß aktiv, dann Auto deaktivieren
    console.log('Aktueller TravelMode:', this.travelModes['WALKING'] ? 'WALKING' : 'DRIVING');
  }

  updateMaxTravelTime(): void {
    this.maxTravelTime = this.isRuralArea ? 900 : 600; // 900s (15 Min) für Land, 600s (10 Min) für Stadt
    console.log(`Maximale akzeptierte Fahrzeit: ${this.maxTravelTime / 60} Minuten`);
  }

  updateSelectedSupermarket(place: google.maps.places.PlaceResult): void {
    if (place) {
      this.selectedSupermarket = place;
      console.log("Ausgewählter Supermarkt:", this.selectedSupermarket);
    }
  }


}//ENDE

