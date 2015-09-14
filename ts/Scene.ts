///<reference path="./lib/jquery/jquery.d.ts"/>
///<reference path="./lib/threejs/three.d.ts"/>
///<reference path="./lib/stats/stats.d.ts"/>

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

    private _planetMaterial: THREE.MeshPhongMaterial;
    private _planet: THREE.Mesh;
    
    private _statsMonitor: Stats;
    private _start;
    
    // methods
    constructor(width: number, height: number, clearColor: any, fov: number, near: number, far: number) {     
        this._width  = width;
        this._height = height;

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(width, height);
        this._renderer.setClearColor(clearColor);
        $("#container").append(this._renderer.domElement);

        this._scene  = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(fov, this._width / this._height, near, far);

        this._start = Date.now();
    }
    
    initScene(shaders): void {
        // generating the material from the shaders
        // this._planetMaterial = new THREE.ShaderMaterial({
        //     uniforms: { 
        //         tExplosion: {
        //             type: "t", 
        //             value: THREE.ImageUtils.loadTexture('ts/textures/explosion.png')
        //         },
        //         time: { // float initialized to 0
        //             type: "f", 
        //             value: 0.0 
        //         }
        //     },
        //     vertexShader: shaders[0], // @fixme: wrong!!
        //     fragmentShader: shaders[1] // @fixme: put identifiers
        // });

        this._planetMaterial = new THREE.MeshPhongMaterial();
        this._planetMaterial.map = THREE.ImageUtils.loadTexture('ts/textures/earthmap.jpg')
        
        this._planetMaterial.bumpMap    = THREE.ImageUtils.loadTexture('ts/textures/earthbump.jpg')
        this._planetMaterial.bumpScale = 1.5
        
        var pointLight = new THREE.PointLight(0xffffff, 2, 1500);
        pointLight.position.set(150, 150, 150);
        this._scene.add( pointLight );
        
        var light = new THREE.AmbientLight(0x404040);
        this._scene.add(light);
        
        this._planet = this.addSphere({
            material: this._planetMaterial,
            position: new THREE.Vector3(0, 0, 0),
            radius: 100,
            widthSegments: 32,
            heightSegments: 32
        });
        
        // positioning the camera
        this._camera.position.z = 400;
    }
    
    render(): void {
        this._statsMonitor.begin();
        
        // rendering iteration code
        this._planet.rotateY(0.0105);
        //this._planetMaterial.uniforms[ 'time' ].value = .00025 * ( Date.now() - this._start );
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