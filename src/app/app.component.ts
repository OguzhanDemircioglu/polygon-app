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
import { Geometry } from 'ol/geom';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  clickedPoints: Point[] = [];

  constructor() { }

  ngOnInit(): void {
    // Haritayı oluştur
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });

    // Noktaları tutacak vektör katmanını oluştur
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      })
    });
    map.addLayer(vectorLayer);

    // Kullanıcının tıklamalarını dinleyen fonksiyon
    const addPointOnClick: (event: MapBrowserEvent<MouseEvent>) => void = (event) => {
      const features = vectorSource.getFeatures();

      // En fazla 5 nokta oluşturulabilir
      if (features.length < 5) {
        const coordinate = map.getEventCoordinate(event.originalEvent);
        const point = new Feature({
          geometry: new Point(coordinate)
        });
        //this.clickedPoints.push(null); // Add clicked point to array
        vectorSource.addFeature(point);
        console.log('Clicked point:', coordinate); // Log each clicked point
      }
    };

    // Haritada tıklamaları dinle
    map.on('click', addPointOnClick);
  }
}
