// Based on https://github.com/mrdoob/three.js/
//     examples/webgl_geometry_colors.html
//
// Isaac Lenton, 2019
//
// Sliders: Time Step, Temperature, Radius, Refractive Index, Power
// Toggles: Display particle, display trace, display incident beam
// Buttons: Stop/Start, Reset

      //if ( WEBGL.isWebGLAvailable() === false ) {
		//		document.body.appendChild( WEBGL.getWebGLErrorMessage() );
	//		}

      var container;

      var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

      var inputStartStop = document.getElementById('button-start-stop');
      var inputReset = document.getElementById('button-reset');

      var inputStep = document.getElementById('slider-step');
      var inputTemperature = document.getElementById('slider-temperature');
      var inputRadius = document.getElementById('slider-radius');
      var inputIndex = document.getElementById('slider-index');
      var inputPower = document.getElementById('slider-power');

      var inputDrawParticle = document.getElementById('toggle-particle');
      var inputDrawTrace = document.getElementById('toggle-trace');
      var inputDrawBeam = document.getElementById('toggle-beam');

      var objParticle;
      var objTrace;
      var objBeam;

      // Connect up the toggles
      inputDrawParticle.addEventListener('input', function(e) {
        objParticle.visible = e.srcElement.checked;
        render();
      });
      inputDrawTrace.addEventListener('input', function(e) {
        objTrace.visible = e.srcElement.checked;
        render();
      });
      inputDrawBeam.addEventListener('input', function(e) {
        objBeam.visible = e.srcElement.checked;
        render();
      });

      init();
			animate();

			function init() {
				container = document.getElementById( 'sim-container' );

        var width = container.clientWidth;
        var height = Math.min(0.5*width, window.innerHeight);

				windowHalfX = width / 2;
				windowHalfY = height / 2;

				camera = new THREE.PerspectiveCamera( 20, width/height, 1, 10000 );
				camera.position.z = 1800;
				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xffffff );
				var light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 0, 0, 1 );
				scene.add( light );

				// shadow
				var canvas = document.createElement( 'canvas' );
				canvas.width = 128;
				canvas.height = 128;
				var context = canvas.getContext( '2d' );

				var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
				gradient.addColorStop( 0.1, 'rgba(180,180,180,1)' );
				gradient.addColorStop( 1, 'rgba(240,240,240,1)' );
				context.fillStyle = gradient;
				context.fillRect( 0, 0, canvas.width, canvas.height );
				var shadowTexture = new THREE.CanvasTexture( canvas );
				var shadowMaterial = new THREE.MeshBasicMaterial( { map: shadowTexture } );
				var shadowGeo = new THREE.PlaneBufferGeometry( 300, 300, 1, 1 );
				var shadowMesh;
				shadowMesh = new THREE.Mesh( shadowGeo, shadowMaterial );
				shadowMesh.position.y = - 250;
				shadowMesh.rotation.x = - Math.PI / 2;
				//scene.add( shadowMesh );
				shadowMesh = new THREE.Mesh( shadowGeo, shadowMaterial );
				shadowMesh.position.y = - 250;
				shadowMesh.position.x = - 400;
				shadowMesh.rotation.x = - Math.PI / 2;
				//scene.add( shadowMesh );
				shadowMesh = new THREE.Mesh( shadowGeo, shadowMaterial );
				shadowMesh.position.y = - 250;
				shadowMesh.position.x = 400;
				shadowMesh.rotation.x = - Math.PI / 2;
				//scene.add( shadowMesh );

        // Draw the sphere
        var radius = 200;
        var geometry = new THREE.SphereGeometry( radius, 32, 32 );
        //var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        objParticle = new THREE.Mesh( geometry, shadowMaterial );
        scene.add( objParticle );

        // Draw the beam
        var cylinder_height = 50;
        var cylinder_segs = 20;
        objBeam = new THREE.Group();
        for (var i = 0; i < cylinder_segs; i++) {

          var z0 = (i-cylinder_segs/2-0.5)*cylinder_height;
          var z1 = (i+1-cylinder_segs/2-0.5)*cylinder_height;

          var wn = 50;
          var lambda = 100;
          var zR = Math.PI * wn * wn / lambda;
          var w0 = wn*Math.sqrt(1 + Math.pow(z0/zR, 2));
          var w1 = wn*Math.sqrt(1 + Math.pow(z1/zR, 2));

          var geometry = new THREE.CylinderGeometry( w1, w0,
              cylinder_height, 32, 2, true);
          var material = new THREE.MeshBasicMaterial(
              {color: 0xffaaaa, transparent: true, opacity: 0.5} );
          var cylinder = new THREE.Mesh( geometry, material );
          cylinder.position.y = (z0+z1)/2;
          objBeam.add(cylinder);
        }
        scene.add(objBeam);

        // TODO: We need to do the simulation

        // Draw line
        var material = new THREE.LineBasicMaterial({
          color: 0x0000ff, transparent: true, opacity: 0.5
        });
        material.depthTest = false;
        var geometry = new THREE.Geometry();
        geometry.vertices.push(
          new THREE.Vector3( -250, 0, 0 ),
          new THREE.Vector3( 0, 250, 0 ),
          new THREE.Vector3( 250, 0, 0 )
        );
        objTrace = new THREE.Line( geometry, material );
        objTrace.visible = false;  // Initially invisible
        scene.add( objTrace );

				var radius = 200;
				var geometry1 = new THREE.IcosahedronBufferGeometry( radius, 1 );
				var count = geometry1.attributes.position.count;
				geometry1.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
				var geometry2 = geometry1.clone();
				var geometry3 = geometry1.clone();
				var color = new THREE.Color();
				var positions1 = geometry1.attributes.position;
				var positions2 = geometry2.attributes.position;
				var positions3 = geometry3.attributes.position;
				var colors1 = geometry1.attributes.color;
				var colors2 = geometry2.attributes.color;
				var colors3 = geometry3.attributes.color;
				for ( var i = 0; i < count; i ++ ) {
					color.setHSL( ( positions1.getY( i ) / radius + 1 ) / 2, 1.0, 0.5 );
					colors1.setXYZ( i, color.r, color.g, color.b );
					color.setHSL( 0, ( positions2.getY( i ) / radius + 1 ) / 2, 0.5 );
					colors2.setXYZ( i, color.r, color.g, color.b );
					color.setRGB( 1, 0.8 - ( positions3.getY( i ) / radius + 1 ) / 2, 0 );
					colors3.setXYZ( i, color.r, color.g, color.b );
				}
				var material = new THREE.MeshPhongMaterial( {
					color: 0xffffff,
					flatShading: true,
					vertexColors: THREE.VertexColors,
					shininess: 0
				} );

				var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );
				var mesh = new THREE.Mesh( geometry1, material );
				var wireframe = new THREE.Mesh( geometry1, wireframeMaterial );
				mesh.add( wireframe );
				mesh.position.x = - 400;
				mesh.rotation.x = - 1.87;
				//scene.add( mesh );
				var mesh = new THREE.Mesh( geometry2, material );
				var wireframe = new THREE.Mesh( geometry2, wireframeMaterial );
				mesh.add( wireframe );
				mesh.position.x = 400;
				//scene.add( mesh );
				var mesh = new THREE.Mesh( geometry3, material );
				var wireframe = new THREE.Mesh( geometry3, wireframeMaterial );
				mesh.add( wireframe );
				//scene.add( mesh );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( width, height );
				container.appendChild( renderer.domElement );

				//stats = new Stats();
				//container.appendChild( stats.dom );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				//
				window.addEventListener( 'resize', onWindowResize, false );
			}

			function onWindowResize() {

        var width = container.clientWidth;
        var height = Math.min(0.5*width, window.innerHeight);

				windowHalfX = width / 2;
				windowHalfY = height / 2;
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize( width, height );
			}
			function onDocumentMouseMove( event ) {
				mouseX = ( event.clientX - windowHalfX );
				mouseY = ( event.clientY - windowHalfY );
			}
			//
			function animate() {
				requestAnimationFrame( animate );
				render();
				//stats.update();
			}
			function render() {
				camera.position.x += ( mouseX - camera.position.x ) * 0.2;
				camera.position.y += ( - mouseY - camera.position.y ) * 0.2;
				camera.lookAt( scene.position );
				renderer.render( scene, camera );
			}

