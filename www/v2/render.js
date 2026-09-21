import * as THREE from './vendor/three.module.min.js';
import { mulberry32, placeLabel } from '../js/util.js';
import { CATALOG, GALAXIES, GROUPS } from './catalog.js';
import { CMB, HORIZON, FIRST_GALAXIES, cameraBasis, inCutaway, makeCloud, makeWeb, renderPosition, toSupergalactic, clamp } from './model.js';

const vertexShader = `
  attribute vec3 tint;
  uniform float pointSize;
  varying vec3 color;
  varying vec3 world;
  varying float depth;
  void main() {
    vec4 p = modelMatrix * vec4(position, 1.0);
    world = p.xyz;
    vec4 mv = viewMatrix * p;
    depth = clamp(1.2 + mv.z * 0.13, 0.25, 1.0);
    color = tint;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = pointSize;
  }
`;
const clipping = `
  uniform float cut;
  uniform vec3 observer;
  uniform vec3 towardCamera;
  uniform vec3 cameraRight;
  uniform vec3 cameraUp;
  varying vec3 world;
  bool clipped() {
    vec3 p = world - observer;
    return cut > 0.5 && dot(p, towardCamera) > 0.0 && dot(p, cameraRight) > abs(dot(p, cameraUp)) * 0.2;
  }
`;
const fragmentShader = `
  uniform float opacity;
  varying vec3 color;
  varying float depth;
  ${clipping}
  void main() {
    if (clipped()) discard;
    float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (r > 1.0) discard;
    gl_FragColor = vec4(color, opacity * depth * (1.0 - smoothstep(0.15, 1.0, r)));
  }
`;

export class AtlasRenderer {
  constructor(canvas, labels) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 9);
    this.labels = labels;
    this.ctx = labels.getContext('2d');
    this.layers = [];
    this.materials = [];
    this.hits = [];
    this.lastFrame = null;
    this.build();
  }

  uniforms(opacity = 1) {
    return { pointSize: { value: 2 }, opacity: { value: opacity }, cut: { value: 0 },
      observer: { value: new THREE.Vector3() }, towardCamera: { value: new THREE.Vector3() },
      cameraRight: { value: new THREE.Vector3() }, cameraUp: { value: new THREE.Vector3() } };
  }

  points(points, colors, size, opacity, position = [0, 0, 0], scale = 1) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
    geometry.setAttribute('tint', new THREE.Float32BufferAttribute(colors.flat(), 3));
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: this.uniforms(opacity),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Points(geometry, material);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    const layer = { mesh, material, position, scale, opacity, size, visible: () => true };
    this.layers.push(layer);
    this.materials.push(material);
    return layer;
  }

  shell(radius, color, opacity) {
    const material = new THREE.ShaderMaterial({
      uniforms: { ...this.uniforms(opacity), tint: { value: new THREE.Color(color) } },
      vertexShader: `varying vec3 world; varying vec3 n; void main() {
        vec4 p = modelMatrix * vec4(position, 1.0); world = p.xyz;
        n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * viewMatrix * p;
      }`,
      fragmentShader: `${clipping} uniform vec3 tint; uniform float opacity; varying vec3 n;
        void main() { if (clipped()) discard;
        float rim = pow(1.0 - abs(n.z), 3.0);
        float grain = sin(world.x * 170.0) * sin(world.y * 123.0) * sin(world.z * 151.0);
        gl_FragColor = vec4(tint, opacity * (0.12 + rim * 0.85 + grain * 0.035));
      }`,
      side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), material);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    this.materials.push(material);
    this.layers.push({ mesh, material, scale: radius, position: [0, 0, 0], opacity, visible: v => v.radius > 5000 });
  }

  build() {
    const outer = makeCloud(42000, FIRST_GALAXIES, 2026, 1800);
    this.outer = this.points(outer, outer.map(p => {
      const t = Math.hypot(...p) / FIRST_GALAXIES;
      return [0.48 + t * 0.25, 0.69 - t * 0.24, 0.8 - t * 0.17];
    }), 1.7, 0.62);
    this.outer.visible = v => v.radius > 850;
    const web = makeWeb(2400, 81);
    this.web = this.points(web, web.map(() => [0.57, 0.72, 0.84]), 1.9, 0.67);
    this.web.visible = v => v.radius > 90 && v.radius < 17000;
    this.shell(CMB, '#e0a775', 0.37);
    this.shell(FIRST_GALAXIES, '#827191', 0.11);
    // A sparse boundary grid gives the observable volume an unambiguous 3D shape.
    const grid = [];
    for (let ring = 0; ring < 7; ring++) {
      const angle = ring / 7 * Math.PI;
      for (let i = 0; i < 540; i++) {
        const t = i / 540 * Math.PI * 2;
        grid.push([Math.cos(t) * Math.cos(angle), Math.cos(t) * Math.sin(angle), Math.sin(t)]);
      }
    }
    for (const z of [-0.66, 0, 0.66]) {
      for (let i = 0; i < 540; i++) {
        const t = i / 540 * Math.PI * 2, r = Math.sqrt(1 - z * z);
        grid.push([Math.cos(t) * r, Math.sin(t) * r, z]);
      }
    }
    const boundary = this.points(grid, grid.map(() => [0.73, 0.65, 0.56]), 1.3, 0.32, [0, 0, 0], HORIZON);
    boundary.visible = v => v.radius > 5000;

    for (let i = 0; i < GROUPS.length; i++) {
      const group = GROUPS[i];
      const cloud = makeCloud(group.name === 'Virgo Cluster' ? 400 : 75, 1, 300 + i);
      const layer = this.points(cloud, cloud.map(() => [0.79, 0.71, 0.61]), 2.2, 0.55, group.position, group.radius);
      layer.visible = v => v.radius >= 3 && v.radius < 2200;
    }
    for (let i = 0; i < GALAXIES.length; i++) {
      const galaxy = GALAXIES[i], random = mulberry32(900 + i);
      const points = [], colors = [];
      const count = galaxy.spiral ? 4200 : 220;
      for (let n = 0; n < count; n++) {
        let point;
        const r = Math.pow(random(), 0.7);
        if (galaxy.spiral) {
          const arm = n % (i === 0 ? 4 : 2);
          const angle = arm * Math.PI * 2 / (i === 0 ? 4 : 2) + Math.log(r + 0.02) * 3.8 + (random() - 0.5) * 0.7;
          point = [Math.cos(angle) * r, Math.sin(angle) * r, (random() - 0.5) * 0.045];
          if (i === 0) point = toSupergalactic(point);
          else point = [point[0], point[1] * 0.7 - point[2] * 0.7, point[1] * 0.7 + point[2] * 0.7];
        } else {
          const z = random() * 2 - 1, a = random() * Math.PI * 2;
          point = [Math.cos(a) * Math.sqrt(1 - z * z) * r, Math.sin(a) * Math.sqrt(1 - z * z) * r, z * r];
        }
        points.push(point);
        colors.push(r < 0.22 ? [1, 0.79, 0.53] : [0.61, 0.74, 0.91]);
      }
      const layer = this.points(points, colors, 1.8, 0.78, galaxy.position, galaxy.radius);
      layer.visible = v => v.radius < 15;
    }
  }

  resize() {
    const { width, height } = this.renderer.domElement.getBoundingClientRect();
    this.width = width; this.height = height;
    this.renderer.setSize(width, height, false);
    const dpr = Math.min(devicePixelRatio, 2);
    this.labels.width = Math.round(width * dpr);
    this.labels.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  draw(view, selected) {
    const { width, height } = this;
    if (!width || !height) return;
    const aspect = width / height, mobile = width < 760;
    const fit = mobile ? Math.max(1, 1 / aspect) : 1;
    this.camera.left = -aspect * fit; this.camera.right = aspect * fit;
    this.camera.top = fit; this.camera.bottom = -fit;
    this.camera.updateProjectionMatrix();
    const basis = cameraBasis(view.yaw, view.pitch);
    const target = new THREE.Vector3(...basis.right).multiplyScalar(mobile ? 0 : -0.33);
    if (mobile) target.addScaledVector(new THREE.Vector3(...basis.up), 0.35 * fit);
    this.camera.up.set(...basis.up);
    this.camera.position.copy(target).addScaledVector(new THREE.Vector3(...basis.forward), 4);
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld();
    const cutting = view.cutaway && view.radius > 5000;
    const observer = view.center.map(v => -v / view.radius);
    for (const material of this.materials) {
      material.uniforms.cut.value = cutting ? 1 : 0;
      material.uniforms.observer.value.set(...observer);
      material.uniforms.towardCamera.value.set(...basis.forward);
      material.uniforms.cameraRight.value.set(...basis.right);
      material.uniforms.cameraUp.value.set(...basis.up);
    }
    for (const layer of this.layers) {
      layer.mesh.visible = layer.visible(view);
      if (!layer.mesh.visible) continue;
      layer.mesh.position.set(...renderPosition(layer.position, view.center, view.radius));
      layer.mesh.scale.setScalar(layer.scale / view.radius);
      const fade = layer === this.web ? clamp(Math.log(17000 / view.radius), 0, 1) : 1;
      layer.material.uniforms.opacity.value = layer.opacity * fade;
      if (layer.size) layer.material.uniforms.pointSize.value = layer.size * this.renderer.getPixelRatio();
    }
    this.renderer.render(this.scene, this.camera);
    this.lastFrame = { view, basis, cutting, fit };
    this.drawLabels(view, selected, basis, cutting, fit);
  }

  project(position, view) {
    const p = new THREE.Vector3(...renderPosition(position, view.center, view.radius)).project(this.camera);
    return { x: (p.x + 1) * this.width / 2, y: (1 - p.y) * this.height / 2, z: p.z };
  }

  drawLabels(view, selected, basis, cutting, fit) {
    const ctx = this.ctx, width = this.width, height = this.height;
    ctx.clearRect(0, 0, width, height);
    this.hits = [];
    const occupied = [];
    const intro = document.getElementById('intro').getBoundingClientRect();
    const stage = this.labels.getBoundingClientRect();
    occupied.push({ x: intro.x - stage.x, y: intro.y - stage.y, w: intro.width, h: intro.height });
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const objects = CATALOG.filter(object => object.type === 'Galaxy cluster' ? view.radius >= 3 && view.radius < 5000 : view.radius < 130);
    objects.sort((a, b) => (b.id === selected?.id ? 100 : b.spiral ? 10 : 0) - (a.id === selected?.id ? 100 : a.spiral ? 10 : 0));
    for (const object of objects) {
      if (cutting && inCutaway(object.position, basis)) continue;
      const p = this.project(object.position, view);
      if (p.z < -1 || p.z > 1 || p.x < 6 || p.x > width - 6 || p.y < 6 || p.y > height - 6) continue;
      const selectedObject = object.id === selected?.id;
      const isCluster = object.type === 'Galaxy cluster';
      ctx.fillStyle = selectedObject || object.id === 'milky-way' ? '#edc08a' : isCluster ? '#c7b79f' : '#b9c8df';
      ctx.beginPath(); ctx.arc(p.x, p.y, object.spiral ? 3 : 2, 0, Math.PI * 2); ctx.fill();
      if (selectedObject) {
        ctx.strokeStyle = '#edc08a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.stroke();
      }
      this.hits.push({ ...p, object, radius: Math.min(25, Math.max(10, object.radius / view.radius / fit * height / 2)) });
      if (!selectedObject && !object.spiral && view.radius > (isCluster ? 950 : 3.5)) continue;
      const text = object.name, textWidth = ctx.measureText(text).width;
      const label = placeLabel(p.x, p.y, textWidth, 13, occupied, { w: width, h: height });
      if (label) {
        occupied.push(label);
        ctx.shadowColor = '#080b12'; ctx.shadowBlur = 5;
        ctx.fillText(text, label.x, label.y + 11);
        ctx.shadowBlur = 0;
      }
    }
    if (view.radius >= 130) {
      const home = this.project([0, 0, 0], view);
      if (home.x > 0 && home.x < width && home.y > 0 && home.y < height) {
        ctx.strokeStyle = '#edc08a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(home.x, home.y, 5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#edc08a'; ctx.font = '11px -apple-system, sans-serif';
        ctx.fillText('Our galaxy', home.x + 12, home.y + 4);
        this.hits.push({ ...home, object: GALAXIES[0], radius: 14 });
      }
    }
    if (view.radius > 15000) {
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = '#b89b7e';
      ctx.fillText('OLDEST LIGHT · 13.8 BILLION YEARS AGO', width * (width < 760 ? 0.2 : 0.48), height - (width < 760 ? 100 : 77));
    }
  }

  pick(x, y) {
    return this.hits.map(hit => ({ ...hit, d: Math.hypot(hit.x - x, hit.y - y) }))
      .filter(hit => hit.d <= hit.radius).sort((a, b) => a.d - b.d)[0]?.object;
  }
}
