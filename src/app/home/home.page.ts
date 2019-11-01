import { Component, OnInit, ViewChild, AfterContentInit, ElementRef, NgZone, Input } from '@angular/core';
import { Platform, LoadingController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { Environment, GoogleMap, GoogleMaps, GoogleMapOptions, Marker, GoogleMapsEvent, MyLocation, GoogleMapsAnimation, Geocoder, ILatLng, Circle, CircleOptions, MarkerCluster, MarkerLabel, MarkerClusterIcon } from '@ionic-native/google-maps'
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
 
declare var google: any

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterContentInit {

  //@Input() isPickupRequested: boolean
  //@ViewChild('autofocus', { static: false }) searchbar: IonInput;

  @ViewChild('map', {static: false}) mapElement: any;
  private loading: any
  // private map: GoogleMap
  public search: string = ''
  private googleAutocomplete = new google.maps.places.AutocompleteService()
  public searchResults = new Array<any>()
  public typing = false
  private originMarker: Marker
  public destination: any
  public circle: Circle
  private googleDirectionsService = new google.maps.DirectionsService()
  map: any;
  address:string;
  public marker
  public cluster: MarkerCluster
  public location_shown: boolean

  plans = {
    nothing: '',
    shared: 'shared',
    dedicated: 'dedicated'
  }

  
  activePlan: string =  this.plans.nothing

   isPickupRequested: boolean

  constructor(
    private platform: Platform, 
    private loadingCtrl: LoadingController,
    private ngZone: NgZone,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private androidFullScreen: AndroidFullScreen,
    public statusBar: StatusBar) { 
      console.log(google)
      this.initializeApp()
      this.isPickupRequested = false
      this.location_shown = false
    }

    initializeApp() {
      this.androidFullScreen.isImmersiveModeSupported()
    .then(() => console.log('Immersive mode supported'))
    .catch(err => console.log(err));
        this.statusBar.show()
        this.statusBar.overlaysWebView(true);
        this.statusBar.styleDefault();

        
    }
   ngOnInit() {
    
   
  }

   ngAfterContentInit() {
    setTimeout(() => {

      this.mapElement = this.mapElement.nativeElement;

      this.mapElement.style.width = this.platform.width() + 'px'
      this.mapElement.style.minHeight = "60%"
      this.loadMap()
    }, 5000);
    
     
  }

  

  confirmPickup() {
    this.isPickupRequested = true
  }

  cancelPickup() {
    this.isPickupRequested = false
  }

  async loadMap(){
    this.loading = await this.loadingCtrl.create({
      message: 'Getting location...'

    })
    await this.loading.present()

    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': environment.googleMapsKey,
      'API_KEY_FOR_BROWSER_DEBUG': environment.googleMapsKey
    })

    

    const mapOptions: GoogleMapOptions = {
      controls: {
        zoom: false
      }
    }
    this.map = GoogleMaps.create(this.mapElement, mapOptions)

    try {
      await this.map.one(GoogleMapsEvent.MAP_READY)
      
      this.addOriginMarker()
    } catch(error) {
      console.log(error)
    } 

  }

  async addShoppers() {

    

    setTimeout(() => {

      this.location_shown = true

      let locations = [
        {title: "shopper A", position: {lat: 5.540738, lng: -0.431087}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height: 24
          }
        } },
        {title: "shopper B", position: {lat: 5.549281, lng: -0.468836}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height: 24
          }
        } },
        {title: "shopper C", position: {lat: 5.593819, lng: -0.431087}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height: 24
          }
        }},
        {title: "shopper D", position: {lat: 5.540738, lng: -0.500724}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height: 24
          }
        }},
        {title: "shopper E", position: {lat: 5.555549, lng: -0.427971}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height: 24
          }
        }},
        {title: "shopper F", position: {lat: 5.547348, lng: -0.407381}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height: 24
          }
        }},
        {title: "shopper G", position: {lat: 5.554182, lng: -0.458171}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height: 24
          }
        }},
        {title: "shopper H", position: {lat: 5.692217, lng: -0.536414}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height: 24
          }
        }},
        {title: "shopper J", position: {lat: 5.686751, lng: -0.410126}, icon: {
          url: '/assets/icon/shopping-bag.png',
      
          size: {
            width: 24,
            height:24
          }
        }},
        ];

        let labelOptions: MarkerLabel = {
          bold: true,
          fontSize: 15,
          color: "white",
          italic: true
        };

        let clusterIcons: MarkerClusterIcon[] = [
          {min: 2, max: 5, url: "/assets/icon/m1.png", anchor: {x: 16, y: 16}, label: labelOptions},
          {min: 5, max: 10, url: "/assets/icon/m2.png", anchor: {x: 16, y: 16}, label: labelOptions},
          {min: 10, max: 20, url: "/assets/icon/m3.png", anchor: {x: 24, y: 24}, label: labelOptions},
          {min: 20, max: 40, url: "/assets/icon/m4.png", anchor: {x: 32,y: 32}, label: labelOptions},
          {min: 40, url: "/assets/icon/m5.png", anchor: {x: 32,y: 32}, label: labelOptions}
        ];
        
        

        
        
        this.cluster = this.map.addMarkerCluster( {
          markers: locations,
          icons: clusterIcons,
          boundsDraw: true,
          maxZoomLevel: 15
         });
     
    }, 2000);
      
  }

  async addOriginMarker() {
    let options = {timeout: 10000, enableHighAccuracy: true }

    this.geolocation.getCurrentPosition(options).then((resp) => {
      console.log(resp.coords.latitude)
      console.log(resp.coords.longitude)
    }).catch((error) => {
      console.log('Error getting location', error);
    });
    
    try {
      const myLocation: MyLocation = await this.map.getMyLocation()
      console.log(myLocation)

      await this.map.moveCamera({
        target: myLocation.latLng,
        zoom: 15
      });

      
      if (!this.location_shown) {
        this.circle =  this.map.addCircleSync({
          center: myLocation.latLng,
          radius: 300,
          strokeColor : '#C8D6EC',
          strokeWidth: 0,
          fillColor : '#C8D6EC'
        });
      }
      

      
     

      this.originMarker = this.map.addMarkerSync({
        title: 'Current Location',
        icon: {
          url: 'https://i.stack.imgur.com/VpVF8.png',
      
          size: {
            width: 12,
            height: 12
          }
        },
        animation: GoogleMapsAnimation.BOUNCE,
        position: myLocation.latLng
      });

    } catch (error) {
      console.log(error)
    } finally {
      this.loading.dismiss()
    }

    this.addShoppers()
  }

  

  searchChanged() {
    //this.typing = true
    
    if(!this.search.trim().length) return;

    this.googleAutocomplete.getPlacePredictions({
      input: this.search
    }, predictions => {
      this.ngZone.run(() => {
        this.searchResults = predictions
      })
      
    })
  }

  async calcRoute(item: any) {
    
    
    this.search = ''
    this.destination = item
    
    const info: any = await Geocoder.geocode({address: this.destination.description})
    
    let markerDestination: Marker = this.map.addMarkerSync({
      title: this.destination.description,
      icon: {
        url: 'https://i.stack.imgur.com/VpVF8.png',
    
        size: {
          width: 12,
          height: 12
        }
      },
      animation: GoogleMapsAnimation.DROP,
      position: info[0].position
    })

    this.googleDirectionsService.route({
      origin: this.originMarker.getPosition(),
      destination: markerDestination.getPosition(),
      travelMode: 'DRIVING'
    }, async results => {
      const points = new Array<ILatLng>()

      const routes = results.routes[0].overview_path

      for (let i=0; i < routes.length; i++) {
        points[i] = {
          lat:  routes[i].lat(),
          lng: routes[i].lng()
        }
      }

      await this.map.addPolyline({
        points: points,
        color: 'black',
        width: 3
      });

      await this.map.moveCamera({
        target: points,
        zoom: false
      });

      // this.map.panBy(0, 100)

    })

    this.typing = false
    
  }

  reformat1(str: string) {
    if (str) {
      return str.split(',')[0];
    }
  return [];
  }

  reformat2(str: string) {
    if (str) {
      return str.split(',')[1];
    }
  return [];
  }

  reformat3(str: string) {
    if (str) {
      return str.split(',')[2];
    }
  return [];
  }

  setSelected(plan: string) {
    this.activePlan = this.plans[plan]

  }

  showMap() {
    //show box msg
    this.typing = false;
    console.log(this.typing)
    setTimeout(() => {

      this.mapElement = this.mapElement.nativeElement;

      this.mapElement.style.width = this.platform.width() + 'px'
      this.mapElement.style.height = this.platform.height() + 'px'
    this.loadMap()
    }, 1000);
    //wait 3 Seconds and hide
    // setTimeout(function() {
    //     this.typing = false;
    //     console.log(this.typing);
    // }.bind(this), 3000);
   }

   setTyping() {
    //show box msg
    this.typing = true;
    console.log(this.typing)

    
   }

   async back() {
    try {
      await this.map.clear();
      this.destination = null
      this.typing = false;
      this.addOriginMarker()
    } catch (error) {
      
    }
   }
  
}