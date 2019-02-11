/* global AFRAME, THREE */

(function () {
  let numTrees = 0

  // tree movement
  const CUSTOM_SHADER_PARS = `
    uniform float time;
    uniform float timeOffset;
    uniform float wind;
  `
  const CUSTOM_SHADER = `
    float t = time + timeOffset;

    float yHor = abs(position.y + 3.5);
    float yVert = abs(position.y + 1.);

    float offsetWind = (sin(t * wind)-1.5) * pow(yHor, 6.) * .00002 * wind;

    float tw = t * wind;
    float branchMod = 1.0;
    float offsetBranchX = sin(tw * 1.2) * sin(tw * 1.2 * 1.5) * mod(position.y + position.x, branchMod) * wind * .04;
    float offsetBranchY = sin(tw) * sin(tw * 1.5) * mod(position.y + position.x, branchMod) * wind * .05;

    transformed += vec3(offsetWind + offsetBranchX, offsetBranchY, 0.);
  `

  AFRAME.registerComponent('tree', {
    schema: {wind: {type: 'number'}},

    init: function () {
      const data = this.data;

      this.color = undefined
      this.material = undefined

      // count for better randomness
      numTrees++

      this.el.addEventListener('model-loaded', () => {
        this.applyToMesh()
      });
    },

    /**
     * Creates a new THREE.ShaderMaterial
     */
    createMaterial () {
      this.material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.common,
          THREE.UniformsLib.lights,
          THREE.UniformsLib.fog,
          { time: { value: 0.0 }},
          { timeOffset: { value: Math.random() * (20 + numTrees) * 100}},
          { wind: { value: this.data.wind }},
          { diffuse: { value: this.color } }
        ]),
        lights: true,
        fog: true,
        fragmentShader: THREE.ShaderLib.lambert.fragmentShader,
        vertexShader: `
          #define LAMBERT

          varying vec3 vLightFront;

          #ifdef DOUBLE_SIDED

            varying vec3 vLightBack;

          #endif

          #include <common>
          #include <uv_pars_vertex>
          #include <uv2_pars_vertex>
          #include <envmap_pars_vertex>
          #include <bsdfs>
          #include <lights_pars>
          #include <color_pars_vertex>
          #include <fog_pars_vertex>
          #include <morphtarget_pars_vertex>
          #include <skinning_pars_vertex>
          #include <shadowmap_pars_vertex>
          #include <logdepthbuf_pars_vertex>
          #include <clipping_planes_pars_vertex>

          ${CUSTOM_SHADER_PARS}

          void main() {

            #include <uv_vertex>
            #include <uv2_vertex>
            #include <color_vertex>

            #include <beginnormal_vertex>
            #include <morphnormal_vertex>
            #include <skinbase_vertex>
            #include <skinnormal_vertex>
            #include <defaultnormal_vertex>

            #include <begin_vertex>
            #include <morphtarget_vertex>
            #include <skinning_vertex>

            ${CUSTOM_SHADER}

            #include <project_vertex>
            #include <logdepthbuf_vertex>
            #include <clipping_planes_vertex>         

            #include <worldpos_vertex>
            #include <envmap_vertex>
            #include <lights_lambert_vertex>
            #include <shadowmap_vertex>
            #include <fog_vertex>
          }
        `
      });
    },

    /**
     * Apply the material to the current entity.
     */
    applyToMesh: function() {
      const mesh = this.el.getObject3D('mesh');

      if (mesh) {
        // sample color for our custom material
        this.color = mesh.children[0].material[0].color

        // create custom material and replace on mesh
        this.createMaterial()
        mesh.children[0].material[0] = this.material;

        // Shadow cast magic here
        mesh.children[0].castShadow = true
        mesh.children[0].customDepthMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            #include <fog_pars_vertex>
            #include <shadowmap_pars_vertex>

            ${CUSTOM_SHADER_PARS}

            void main() {

              #include <begin_vertex>

              ${CUSTOM_SHADER}

              #include <project_vertex>
              #include <worldpos_vertex>
              #include <shadowmap_vertex>
              #include <fog_vertex>

            }
          `,
          fragmentShader: THREE.ShaderLib.shadow.fragmentShader,
          uniforms: this.material.uniforms
        });
      }
    },

    /**
     * On each frame, update the 'time' uniform in the shaders.
     */
    tick: function (t) {
      if (this.material) {
        this.material.uniforms.time.value = t / 1000
      }
    }

  })

})()