<template>
    <div id="portal" class="gpPortal"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Very Important! The name of the component must match the file name.
// Don't forget to do this. This is a note so you don't forget.
const ComponentName = 'GPPortal_Three';
export default defineComponent({
    name: ComponentName,
    // Used to add Custom Components
    components: {},
    // Used to define state
    data() {
        return {
            //
        };
    },
    // Called when the page is loaded.
    mounted() {
        // Bind Events to Methods
        if ('alt' in window) {
            // alt.on('x', this.whatever);
            alt.on(`${ComponentName}:SendSomeData`, this.sendSomeData);
            alt.emit(`${ComponentName}:Ready`);
        }

        // Add Keybinds for In-Menu
        document.addEventListener('keyup', this.handleKeyPress);

        setTimeout(this.initScene(), 900);
    },
    // Called when the page is unloaded.
    unmounted() {
        // Make sure to turn off any document events as well.
        // Only if they are present of course.
        // Example:
        // document.removeEventListener('mousemove', this.someFunction)
        if ('alt' in window) {
            alt.off(`${ComponentName}:Close`, this.close);
        }

        // Remove Keybinds for In-Menu
        document.removeEventListener('keyup', this.handleKeyPress);
    },
    // Used to define functions you can call with 'this.x'
    methods: {
        handleKeyPress(e) {
            // Escape Key
            if (e.keyCode === 27 && 'alt' in window) {
                alt.emit(`${ComponentName}:Close`);
            }
        },
        sendSomeData(arg1: string) {
            console.log(arg1);
        },
        initScene() {
            // ------------------------------------------------
            // BASIC SETUP
            // ------------------------------------------------

            // Create an empty scene
            var scene = new window['THREE'].Scene();

            // Create a basic perspective camera
            var camera = new window['THREE'].PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 4;

            // Create a renderer with Antialiasing
            var renderer = new window['THREE'].WebGLRenderer({ antialias: true });

            // Configure renderer clear color
            renderer.setClearColor('#000000');

            // Configure renderer size
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Append Renderer to DOM
            document.body.appendChild(renderer.domElement);

            // ------------------------------------------------
            // FUN STARTS HERE
            // ------------------------------------------------

            // Create a Cube Mesh with basic material
            var geometry = new window['THREE'].BoxGeometry(1, 1, 1);
            var material = new window['THREE'].MeshBasicMaterial({ color: '#433F81' });
            var cube = new window['THREE'].Mesh(geometry, material);

            // Add cube to Scene
            scene.add(cube);

            // Render Loop
            var render = function () {
                requestAnimationFrame(render);

                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;

                // Render the scene
                renderer.render(scene, camera);
            };

            render();

            this.portalParticles = [];
            this.smokeParticles = [];
            this.scene = new window['THREE'].Scene();

            this.sceneLight = new window['THREE'].DirectionalLight(0xffffff, 0.5);
            this.sceneLight.position.set(0, 0, 1);
            this.scene.add(this.sceneLight);

            this.portalLight = new window['THREE'].PointLight(0x062d89, 30, 600, 1.7);
            this.portalLight.position.set(0, 0, 250);
            this.scene.add(this.portalLight);

            this.cam = new window['THREE'].PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
            this.cam.position.z = 1000;
            this.scene.add(this.cam);

            this.renderer = new window['THREE'].WebGLRenderer();
            this.renderer.setClearColor(0x000000, 1);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(this.renderer.domElement);

            this.particleSetup();
        },
        particleSetup() {
            let loader = new window['THREE'].TextureLoader();
            loader.load('/src/pages/gpPortal/img/smoke.png', this.loadParticles);
        },
        loadParticles(texture) {
            let portalGeo = new window['THREE'].PlaneBufferGeometry(350, 350);
            let portalMaterial = new window['THREE'].MeshStandardMaterial({
                map: texture,
                transparent: true,
            });

            let smokeGeo = new window['THREE'].PlaneBufferGeometry(1000, 1000);
            let smokeMaterial = new window['THREE'].MeshStandardMaterial({
                map: texture,
                transparent: true,
            });

            for (let p = 880; p > 250; p--) {
                let particle = new window['THREE'].Mesh(portalGeo, portalMaterial);
                particle.position.set(
                    0.5 * p * Math.cos((4 * p * Math.PI) / 180),
                    0.5 * p * Math.sin((4 * p * Math.PI) / 180),
                    0.1 * p,
                );
                particle.rotation.z = Math.random() * 360;
                this.portalParticles.push(particle);
                this.scene.add(particle);
            }

            for (let p = 0; p < 40; p++) {
                let particle = new window['THREE'].Mesh(smokeGeo, smokeMaterial);
                particle.position.set(Math.random() * 1000 - 500, Math.random() * 400 - 200, 25);
                particle.rotation.z = Math.random() * 360;
                particle.material.opacity = 0.6;
                this.portalParticles.push(particle);
                this.scene.add(particle);
            }
            this.clock = new window['THREE'].Clock();
            this.animate();
        },
        animate() {
            let delta = this.clock.getDelta();
            this.portalParticles.forEach((p) => {
                p.rotation.z -= delta * 1.5;
            });
            this.smokeParticles.forEach((p) => {
                p.rotation.z -= delta * 0.2;
            });
            if (Math.random() > 0.9) {
                this.portalLight.power = 350 + Math.random() * 500;
            }
            this.renderer.render(this.scene, this.cam);
            requestAnimationFrame(this.animate);
        },
    },
});
</script>

<style scoped>
body {
    margin: 0;
    overflow: hidden;
}
</style>
