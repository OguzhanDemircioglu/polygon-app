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
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {urlConstants} from "./constants/Constants";
import {Polygon} from "./req-res/Polygon";
import {ReactiveFormsModule} from "@angular/forms";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import * as olProj from 'ol/proj';

interface ClickedPoint {
  coordinates: number[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, ReactiveFormsModule, NgxDatatableModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  showCancelButton = false;
  vectorSource = new VectorSource();
  vectorLayer = new VectorLayer();
  pointsAdded = 0;
  clickedPoints: ClickedPoint[] = [];
  title: string = 'polygon-app';
  pointsToSend: { coordinates: number[]; username: string, number: string }[] = [];
  items: Polygon[] = [];
  public map: Map | undefined;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.map?.addLayer(this.vectorLayer);
    olProj.useGeographic();

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: '',
            crossOrigin: 'anonymous'
          })
        }),
        this.vectorLayer,
      ],
      view: new View({
        center: [39.9392, 32.8962],
        zoom: 3,
      }),
    });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({color: 'red'}),
          stroke: new Stroke({color: 'white', width: 2}),
        }),
      }),
    });
    this.map?.addLayer(this.vectorLayer);

    const addPointButton = document.getElementById('add-point-button');

    const addPointOnClick: (event: MapBrowserEvent<MouseEvent>) => void = (event) => {

      this.showCancelButton = true;

      const features = this.vectorSource.getFeatures();

      if (features.length < 5) {
        const clickedCoordinate = this.map?.getEventCoordinate(event.originalEvent);
        if (clickedCoordinate) {
          const coordinates = [clickedCoordinate[0], clickedCoordinate[1]];

          const clickedPoint: ClickedPoint = {
            coordinates,
          };

          const point = new Feature({
            geometry: new Point(coordinates),
          });
          this.vectorSource.addFeature(point);
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
        this.map?.on('click', addPointOnClick);
      });
    }
  }

  refresh() {
    window.location.reload();
  }

  sendPoints() {
    const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
    const username = usernameInput?.value || '';

    const numberInput = document.getElementById('numberInput') as HTMLInputElement;
    const number = numberInput?.value || '';

    for (const clickedPoint of this.clickedPoints) {
      this.pointsToSend.push({coordinates: clickedPoint.coordinates, username, number});
    }

    if (username === '') {
      alert('Username cannot be empty!');
      return;
    }

    if (number === '') {
      alert('Number cannot be empty!');
      return;
    }

    this.postMap();
  }

  queryDrawing() {
    const modal = document.getElementById('modal1');
    if (modal) {
      modal.style.display = 'block';
    } else {
      console.error('Modal element with ID "modal" not found.');
    }

    this.findAll();
  }

  private async findAll() {
    this.http.get<any>(urlConstants.ROOT.ROOT_ADDRESS)
      .subscribe({
        next: (response) => {
          this.items = response;
        },
        error: (error) => {
          console.log(error)
        }
      });
  }

  private async postMap() {

    const polygon: Polygon = new Polygon();
    polygon.username = this.pointsToSend[0].username;
    polygon.number = this.pointsToSend[0].number;

    polygon.list = this.pointsToSend.map(pointData => ({
      Latitude: pointData.coordinates[0],
      Longitude: pointData.coordinates[1]
    }));

    this.http.post<any>(urlConstants.ROOT.ROOT_ADDRESS, polygon)
      .subscribe({
        next: () => {
          window.location.reload();
        },
        error: (error) => {
          console.log(error)
        }
      });
  }

  showDetails(row: any) {
    const modal = document.getElementById('modal1');
    if (modal) {
      modal.style.display = 'none';
    } else {
      console.error('Modal element with ID "modal" not found.');
    }
    const list = row.list.map((item: any) => [item.latitude, item.longitude]);
    this.addMarker(list.map((coordinate: [number, number][]) => coordinate.reverse()));
  }

  addMarker(coordinates: [number, number][]): void {
    console.log('Coordinates:', coordinates); // Log the entire array

    coordinates.forEach((coordinate: [number, number], index: number) => {
      console.log('Adding marker at index:', index, 'with coordinates:', coordinate);

      const marker = new Feature({
        geometry: new Point(coordinate)
      });

      marker.setStyle(new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({color: 'red'}),
          stroke: new Stroke({color: 'white', width: 2}),
        }),
      }));

      this.vectorSource.addFeature(marker);

    });
  }

}
