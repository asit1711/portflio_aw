document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js libraries are loaded before initializing
    const checkLibraries = () => {
        if (typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
            setupSkillsSphere();
        } else {
            setTimeout(checkLibraries, 100);
        }
    };

    let scene, camera, renderer, controls, wordMeshes = [];

    // Responsive configuration with an increased radius for more space
    const getConfig = () => {
        const width = window.innerWidth;
        if (width <= 768) { // Mobile
            return { radius: 5.5, fontSize: 70, cameraZ: 20 };
        }
        // Desktop
        return { radius: 7.0, fontSize: 80, cameraZ: 18 };
    };

    // Main function to build the 3D scene
    const init = () => {
        const container = document.getElementById('skills-canvas-container');
        if (!container) return;

        const loader = document.getElementById('skills-loader');
        if (loader) loader.style.display = 'flex';

        const config = getConfig();

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = config.cameraZ;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        Object.assign(controls, {
            enablePan: false,
            enableZoom: false,
            autoRotate: true,
            autoRotateSpeed: 0.5,
            enableDamping: true,
            dampingFactor: 0.05
        });

        const skills = ['HTML5','CSS3','JavaScript','Python','Django','Flask','React.js','Node.js','Express.js','MongoDB','PostgreSQL','MySQL','Git','Java','REST API','GraphQL','GSAP','Three.js','Lenis.js','ScrollTrigger','Bootstrap','Firebase','DSA'];
        wordMeshes = [];
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        skills.forEach((skill, i) => {
            const y = 1 - (i / (skills.length - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = goldenAngle * i;
            const position = new THREE.Vector3(config.radius * Math.cos(theta) * radiusAtY, config.radius * y, config.radius * Math.sin(theta) * radiusAtY);

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const font = `${config.fontSize}px 'Roboto Mono', monospace`;
            context.font = font;

            canvas.width = context.measureText(skill).width + 30;
            canvas.height = config.fontSize * 1.3;

            context.font = font;
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            // **THE FOOLPROOF VISIBILITY TECHNIQUE**
            // 1. Draw a soft, dark outline/shadow first.
            context.shadowColor = "rgba(0,0,0,0.7)";
            context.shadowBlur = 10;
            context.lineWidth = 5;
            context.strokeText(skill, canvas.width / 2, canvas.height / 2);

            // 2. Draw the bright, main text on top.
            context.shadowBlur = 0; // Turn off shadow for the main fill
            context.fillStyle = '#F5F5F5'; // A bright, slightly off-white color
            context.fillText(skill, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(material);
            sprite.position.copy(position);

            const scaleFactor = 1.0;
            sprite.scale.set((canvas.width / 100) * scaleFactor, (canvas.height / 100) * scaleFactor, 1.0);

            sprite.userData = { originalScale: sprite.scale.clone() };
            scene.add(sprite);
            wordMeshes.push(sprite);
        });

        updateThemeLights(); // Apply lights and fog on initial creation
        if (loader) loader.style.display = 'none';
        animate();
    };

    // This function now ONLY updates lights and fog, which is reliable
    const updateThemeLights = () => {
        if (!scene) return;

        const accentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
        const accentSecondary = getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim();
        const bgSecondary = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();

        scene.fog = new THREE.Fog(bgSecondary, camera.position.z + 5, camera.position.z + 25);

        // Remove old lights before adding new ones with updated colors
        scene.children = scene.children.filter(child => !child.isLight);

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const pointLight1 = new THREE.PointLight(accentPrimary, 1.5, 100);
        pointLight1.position.set(12, 12, 12);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(accentSecondary, 1.5, 100);
        pointLight2.position.set(-12, -12, -12);
        scene.add(pointLight2);
    };

    let hoveredObject = null;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-Infinity, -Infinity);
    const universalTextColor = new THREE.Color('#F5F5F5');

    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(wordMeshes);

        const accentPrimaryColor = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim());

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (hoveredObject !== object) {
                if (hoveredObject) {
                    gsap.to(hoveredObject.material.color, { ...universalTextColor, duration: 0.3 });
                    gsap.to(hoveredObject.scale, { x: hoveredObject.userData.originalScale.x, y: hoveredObject.userData.originalScale.y, duration: 0.3 });
                }
                hoveredObject = object;
                gsap.to(hoveredObject.material.color, { ...accentPrimaryColor, duration: 0.3 });
                gsap.to(hoveredObject.scale, { x: hoveredObject.userData.originalScale.x * 1.15, y: hoveredObject.userData.originalScale.y * 1.15, duration: 0.3 });
                controls.autoRotateSpeed = 0.1;
            }
        } else if (hoveredObject) {
            gsap.to(hoveredObject.material.color, { ...universalTextColor, duration: 0.3 });
            gsap.to(hoveredObject.scale, { x: hoveredObject.userData.originalScale.x, y: hoveredObject.userData.originalScale.y, duration: 0.3 });
            hoveredObject = null;
            controls.autoRotateSpeed = 0.5;
        }
        renderer.render(scene, camera);
    };

    // --- Setup Event Listeners ---
    document.getElementById('skills-canvas-container').addEventListener('mousemove', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(init, 250);
    });

    // Listen for theme change ONLY to update lights, not text color
    window.addEventListener('themeChanged', updateThemeLights);

    const setupSkillsSphere = () => init();

    checkLibraries();
});