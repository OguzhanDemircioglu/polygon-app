import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { MapBrowserEvent } from 'ol';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  clickedPoints: Point[] = [];

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

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      }),
    });
    map.addLayer(vectorLayer);

    const addPointOnClick: (event: MapBrowserEvent<MouseEvent>) => void = (
      event
    ) => {
      const features = vectorSource.getFeatures();

      if (features.length < 5) {
        const coordinate = map.getEventCoordinate(event.originalEvent);
        const point = new Feature({
          geometry: new Point(coordinate),
        });
        
        vectorSource.addFeature(point);
        console.log('Clicked point:', coordinate); 
      }
    };

    map.on('click', addPointOnClick);
  }
}
