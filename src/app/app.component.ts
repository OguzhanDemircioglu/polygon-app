import {RouterOutlet} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {MapBrowserEvent} from 'ol';
import {CommonModule} from "@angular/common";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

interface ClickedPoint {
  coordinates: number[];
  username: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  vectorSource = new VectorSource();
  pointsAdded = 0;
  clickedPoints: ClickedPoint[] = [];
  selectedPoints: { coordinates: number[]; username: string }[] = [];

  constructor() {}

  ngOnInit(): void {

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: '',
            crossOrigin: 'anonymous'
          })
        })
      ],
      view: new View({
        center: [39.9392, 32.8962],
        zoom: 1,
      }),
    });

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({color: 'red'}),
          stroke: new Stroke({color: 'white', width: 2}),
        }),
      }),
    });
    map.addLayer(vectorLayer);

    const addPointButton = document.getElementById('add-point-button');

    const addPointOnClick: (event: MapBrowserEvent<MouseEvent>) => void = (event) => {
      const features = this.vectorSource.getFeatures();

      if (features.length < 5) {
        const clickedCoordinate = map.getEventCoordinate(event.originalEvent);
        if (clickedCoordinate) {
          const coordinates = [clickedCoordinate[0], clickedCoordinate[1]];

          const clickedPoint: ClickedPoint = {
            coordinates,
            username: '',
          };

          const point = new Feature({
            geometry: new Point(coordinates),
          });
          this.vectorSource.addFeature(point);
          console.log('Clicked point:', coordinates);
          this.pointsAdded++;

          this.clickedPoints.push(clickedPoint);
        }
      }

      if (this.pointsAdded === 5) {
        const modal = document.getElementById('modal');
        if (modal) {
          modal.style.display = 'block';
        } else {
          console.error('Modal element with ID "modal" not found.');
        }
      }
    };

    if (addPointButton) {
      addPointButton.addEventListener('click', () => {
        map.on('click', addPointOnClick);
      });
    }
  }

  refresh() {
    window.location.reload()
  }

  sendPoints() {
    console.log('Gönder butonuna tıklandı!');
    const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
    const username = usernameInput?.value || '';

    const pointsToSend: { coordinates: number[]; username: string }[] = [];

    for (const clickedPoint of this.clickedPoints) {
      pointsToSend.push({coordinates: clickedPoint.coordinates, username});
    }

    console.log('Seçilen Nokta Koordinatları:', pointsToSend);
    window.location.reload();
  }
}
