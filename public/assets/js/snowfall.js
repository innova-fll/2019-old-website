/* global AFRAME, THREE, SPE */

(function () {

  const SNOWFLAKE_SRC = 'https://cdn.glitch.com/af8fd0e3-85aa-43db-9e95-d301f03cc283%2Fsmokeparticle.png?1509713015620'
  
  AFRAME.registerComponent('snowfall', {
    schema: {},
    
    init: function () {
      const data = this.data;

      THREE.ImageUtils.crossOrigin = '';
          
      this.createParticles()    
      this.el.setObject3D('mesh', this.particleGroup.mesh);
    
    },
  
    createParticles: function () {
      this.particleGroup = new SPE.Group({
        texture: {
          value: THREE.ImageUtils.loadTexture(SNOWFLAKE_SRC)
        },
        maxParticleCount: 1000,
        hasPerspective: true,
        blending: THREE.AddativeBlending,
        transparent: true
      });

      this.emitter = new SPE.Emitter({
        maxAge: {
          value: 30
        },
        position: {
          value: new THREE.Vector3(0, 0, 0),
          spread: new THREE.Vector3(10, 10, 10)
        },
        acceleration: {
          value: new THREE.Vector3(0, 0, 0),
          spread: new THREE.Vector3( .2, 0, .2 )
        },
        velocity: {
          value: new THREE.Vector3(0, -0.5, 0),
          spread: new THREE.Vector3(1, 0.5, 1)
        },
        color: {
          value: [ new THREE.Color('#ffffff') ]
        },
        size: {
          value: [.05]
        },
        wiggle: {
          value: 5
        },
        opacity: {
          value: [0.4,0.9]
        },
        particleCount: 1000
      })
      
      this.particleGroup.addEmitter(this.emitter)
    },

    /**
     * On each frame, update the 'time' uniform in the shaders.
     */
    tick: function (time, timeDelta) {
      this.particleGroup && this.particleGroup.tick(timeDelta/1000)
    }
  })
  
}())