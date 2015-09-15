// external libs
///<reference path="./lib/jquery/jquery.d.ts"/>
///<reference path="./lib/threejs/three.d.ts"/>
///<reference path="./lib/stats/stats.d.ts"/>

// app classes
///<reference path="./Scene.ts"/>

window.onload = () => Application.main();

class Application {
    private static _scene: Scene;
    private static _statMonitor: Stats;
    private static _shaders: any;
    
    public static main(): void {
        console.log('Starting application.');

        // Waiting for shader to load and init the scene
        var shaderUrlPrefix = 'ts/shaders/',
            me = this;
            
        console.log(Date.now() + ' Loading resources...');
        $.when(
            $.get(shaderUrlPrefix + 'planet.vert'),
            $.get(shaderUrlPrefix + 'planet.frag')
        ).then(function() {
            console.log(Date.now() + ' Loaded.');
            
            me._shaders = [];
            for (var i = 0; i < arguments.length; i++) {
                me._shaders.push(arguments[i][0]);
            }
            
            console.log(Date.now() + ' Initialize the scene.');
            me.initScene();
            me.initStatMonitor();
            me._scene.setStatsMonitor(me._statMonitor);
            me._scene.render();
        });
    }
    
    private static initScene(): void {
        this._scene = new Scene(window.innerWidth, window.innerHeight, 0x101010, 75, 0.1, 10000);
        this._scene.setStatsMonitor(this._statMonitor);
        this._scene.initScene(this._shaders);
    }
    
    private static initStatMonitor(): void {
        this._statMonitor = new Stats();
        this._statMonitor.setMode(0);

        this._statMonitor.domElement.style.position = 'absolute';
        this._statMonitor.domElement.style.left = '0px';
        this._statMonitor.domElement.style.top = '0px';
        
        $("#container").append(this._statMonitor.domElement);
    }
}