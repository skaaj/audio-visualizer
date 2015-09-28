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
    private _camera: THREE.PerspectiveCamera;
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
        this._planetMaterial = new THREE.MeshPhongMaterial();
        this._planetMaterial.map = THREE.ImageUtils.loadTexture('assets/textures/earthmap.jpg')
        
        this._planetMaterial.bumpMap    = THREE.ImageUtils.loadTexture('assets/textures/earthbump.jpg')
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
            widthSegments: 16,
            heightSegments: 16
        });
        
        // skybox stuff
        var skyboxUrls = [
            'assets/textures/backImage.png',
            'assets/textures/downImage.png',
            'assets/textures/frontImage.png',
            'assets/textures/leftImage.png',
            'assets/textures/rightImage.png',
            'assets/textures/upImage.png'
        ];
        
        var cubemap = THREE.ImageUtils.loadTextureCube(skyboxUrls);
        cubemap.format = THREE.RGBFormat;
        
        var shader = THREE.ShaderLib['cube'];
        shader.uniforms['tCube'].value = cubemap;
        
        var skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        var skybox = new THREE.Mesh(
            new THREE.CubeGeometry(1000, 1000, 1000),
            skyBoxMaterial
        );
        
        this._scene.add(skybox);
        
        // positioning the camera
        this._camera.position.z = 360;
    }
    
    render(): void {
        this._statsMonitor.begin();
        
        // rendering iteration code
        this._planet.rotateY(0.0105);
        
        // @fixme: array shouldn't be use that way (waiting for proper Audio.ts)
        // @todo: GPU-side displacement
        var nbVertices = this._planet.geometry.vertices.length,
            tmp = [],
            step = Math.floor(array.length / nbVertices),
            j = 0,
            i, vertex, displacement;
        for (i = 0; i < nbVertices; i++) {
            vertex = this._planet.geometry.vertices[i];
            tmp.push($.extend({}, vertex));
            displacement = (array[j] != null) ? array[j] / 255 : 0;
            vertex.multiplyScalar(1.0 + displacement);
            j += step;
        }
        
        this._planet.geometry.verticesNeedUpdate = true;
        this._renderer.render(this._scene, this._camera);
        
        this._planet.geometry.vertices = tmp;
        this._planet.geometry.verticesNeedUpdate = true;        
        
        this._statsMonitor.end();
        
        // render loop
        window.requestAnimationFrame(() => this.render());
    }
    
    setStatsMonitor(sm: Stats) : void {
        this._statsMonitor = sm;
    }
    
    addSphere(config: SphereConfig): THREE.Mesh {
        var geometry = new THREE.IcosahedronGeometry(config.radius, 2); //config.widthSegments, config.heightSegments);
        var sphere = new THREE.Mesh(geometry, config.material);

        sphere.translateX(config.position.x);
        sphere.translateY(config.position.y);
        sphere.translateZ(config.position.z);

        this._scene.add(sphere);

        return sphere;
    }
}