///<reference path="./libs/threejs/three.d.ts"/>

class Application {
    public static main(): void {
        console.log('Application.main');

        // create the scene and starts rendering loop
        var scene = new Scene(window.innerWidth, window.innerHeight, 0x101010, 75, 0.1, 1000);
        scene.render();
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

    private _planet: THREE.Mesh;

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
        
        // populating the scene
        this._planet = this.addSphere({
            material: new THREE.MeshPhongMaterial({color: 0x00ff00, wireframe: true}),
            position: new THREE.Vector3(0, 0, 0),
            radius: 2,
            widthSegments: 64,
            heightSegments: 64
        });
        
        var ambientLight = new THREE.AmbientLight(0x000000);
        var lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 1, 0);
        lights[1] = new THREE.PointLight(0xffffff, 0.1, 0);
        
        lights[0].position.set(20, 0, 0);
        lights[1].position.set(0, 0, 5);

        this._scene.add(ambientLight);
        this._scene.add(lights[0]);
        this._scene.add(lights[1]);
        this._scene.add(lights[2]);
        
        // positioning the camera
        this._camera.position.z = 10;
    }
    
    render(): void{
        window.requestAnimationFrame(() => this.render());
        
        this._planet.rotateY(0.0105);
        
        this._renderer.render(this._scene, this._camera);     
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