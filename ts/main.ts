///<reference path="./libs/jquery/jquery.d.ts"/>
///<reference path="./libs/threejs/three.d.ts"/>
///<reference path="./libs/stats/stats.d.ts"/>

class Application {
    private static _statsMonitor: Stats;
    
    public static main(): void {
        console.log('Application.main');

        // adds the monitoring frame
        this._statsMonitor = new Stats();
        this._statsMonitor.setMode(0);

        this._statsMonitor.domElement.style.position = 'absolute';
        this._statsMonitor.domElement.style.left = '0px';
        this._statsMonitor.domElement.style.top = '0px';
        
        document.body.appendChild(this._statsMonitor.domElement);
        
        // load the shaders
        var shaders = this.loadShaders();
        
        var scene = new Scene(window.innerWidth, window.innerHeight, 0x101010, 75, 0.1, 1000);
        scene.setStatsMonitor(this._statsMonitor);
        scene.initScene(shaders);
        scene.render();
    }
    
    private static loadShaders(): any {
        var urls = ['planet.vert', 'planet.frag'],
            length = urls.length,
            container = {};
        
        for (var i = 0; i < length; i++) {
            $.ajax({
                url: 'ts/shaders/' + urls[i],
                async: false, //@fixme: deprecated...
                context: {container: container, urls: urls, index: i}
            }).done(function(response){
                this.container[this.urls[this.index]] = response;
            });
        }
        
        return container;
    }
}

interface SphereConfig {
    material: THREE.Material;
    position: THREE.Vector3;
    radius: number;
    widthSegments?: number;
    heightSegments?: number;
}

class Scene {
    // attributes
	private _renderer: THREE.WebGLRenderer;
    private _scene: THREE.Scene;
    private _camera: THREE.Camera;
    private _width: number;
    private _height: number;

    private _planetMaterial: THREE.ShaderMaterial;
    private _planet: THREE.Mesh;
    
    private _statsMonitor: Stats;
    private _start;
    
    // methods
    constructor(width: number, height: number, clearColor: any, fov: number, near: number, far: number) {     
        this._width  = width;
        this._height = height;

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(width, height);
        this._renderer.setClearColor(clearColor);
        document.body.appendChild(this._renderer.domElement);

        this._scene  = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(fov, this._width / this._height, near, far);

        this._start = Date.now();
    }
    
    initScene(shaders): void {
        // generating the material from the shaders
        this._planetMaterial = new THREE.ShaderMaterial({
            uniforms: { 
                tExplosion: {
                    type: "t", 
                    value: THREE.ImageUtils.loadTexture('ts/textures/explosion.png')
                },
                time: { // float initialized to 0
                    type: "f", 
                    value: 0.0 
                }
            },
            vertexShader: shaders['planet.vert'],
            fragmentShader: shaders['planet.frag']
        });
        
        this._planet = this.addSphere({
            material: this._planetMaterial,
            position: new THREE.Vector3(0, 0, 0),
            radius: 100,
            widthSegments: 128,
            heightSegments: 128
        });
        
        // positioning the camera
        this._camera.position.z = 400;
    }
    
    render(): void {
        this._statsMonitor.begin();
        
        // rendering iteration code
        //this._planet.rotateY(0.0105);
        this._planetMaterial.uniforms[ 'time' ].value = .00025 * ( Date.now() - this._start );
        this._renderer.render(this._scene, this._camera);
        
        this._statsMonitor.end();
        
        // render loop
        window.requestAnimationFrame(() => this.render());
    }
    
    setStatsMonitor(sm: Stats) : void {
        this._statsMonitor = sm;
    }
    
    addSphere(config: SphereConfig): THREE.Mesh {
        var geometry = new THREE.SphereGeometry(config.radius, config.widthSegments, config.heightSegments);
        var sphere = new THREE.Mesh(geometry, config.material);

        sphere.translateX(config.position.x);
        sphere.translateY(config.position.y);
        sphere.translateZ(config.position.z);

        this._scene.add(sphere);

        return sphere;
    }
}

Application.main();