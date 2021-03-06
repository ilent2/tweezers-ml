// Based on https://github.com/mrdoob/three.js/
//     examples/webgl_geometry_colors.html
//
// Isaac Lenton, 2019
//
// Sliders: Time Step, Temperature, Radius, Refractive Index, Power
// Toggles: Display particle, display trace, display incident beam
// Buttons: Stop/Start, Reset

      var container;

      var raycaster = new THREE.Raycaster();
      var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

      var infoText = document.getElementById('sim-info');
      var infoPosition = document.getElementById('sim-info-position');

      var inputStartStop = document.getElementById('button-start-stop');
      var inputReset = document.getElementById('button-reset');

      var inputStep = document.getElementById('slider-step');
      var inputTemperature = document.getElementById('slider-temperature');
      var inputRadius = document.getElementById('slider-radius');
      var inputIndex = document.getElementById('slider-index');
      var inputPower = document.getElementById('slider-power');

      var inputDrawParticle = document.getElementById('toggle-particle');
      //var inputDrawTrace = document.getElementById('toggle-trace');
      var inputDrawBeam = document.getElementById('toggle-beam');

      var objParticle;
      var objTrace;
      var objBeam;

      // Connect up the toggles
      inputDrawParticle.onchange = function(e) {
        objParticle.visible = e.srcElement.checked;
        render();
      };
      //inputDrawTrace.addEventListener('input', function(e) {
      //  objTrace.visible = e.srcElement.checked;
      //  render();
      //});
      inputDrawBeam.onchange = function(e) {
        objBeam.visible = e.srcElement.checked;
        render();
      };

      var bRunning = true;
      inputStartStop.onclick = function(e) {
        if (bRunning) {
          inputStartStop.innerText = "Start";
          bRunning = false;
        } else {
          inputStartStop.innerText = "Stop";
          bRunning = true;
        }
      };

      var wavelength = 1064e-9/1.33;

      var position = [0, 0, 0];
      var temperature = 178;
      var dt = 3.98e-5;
      var radius = 3.16e-1;
      var power = 0.051;
      var index = 1.67;

      // Variables for trap stiffness estimation
      //const numStiffPoints = 100;
      //var currStiffPoint = 0;
      //var lastForces = new Array(numStiffPoints*3);
      //var lastPositions = new Array(numStiffPoints*3);

      function calculateStiffness() {
        // Calculate trap stiffness from last numStiffPoints

        kx = 0;
        ky = 0;
        kz = 0;
        const N = numStiffPoints;   // alias
        for (var ii = 1; ii < numStiffPoints; ++ii) {
          kx += (lastForces[ii] - lastForces[ii-1])
              /(lastPositions[ii] - lastPositions[ii-1]);
          ky += (lastForces[ii+N] - lastForces[ii-1+N])
              /(lastPositions[ii+N] - lastPositions[ii-1+N]);
          kz += (lastForces[ii+2*N] - lastForces[ii-1+2*N])
              /(lastPositions[ii+2*N] - lastPositions[ii-1+2*N]);
        }
        kx = kx / N;
        ky = ky / N;
        kz = kz / N;

        return [kx, ky, kz];
      }

      inputReset.onclick = function() {
	position = [0, 0, 0];

	// Update the scene
	objParticle.position.x = position[0]*scale;
	objParticle.position.y = position[1]*scale;
	objParticle.position.z = position[2]*scale;
	render();
      };

      function updateInfo() {
        infoText.innerHTML = `dt = ${dt.toExponential(2)}s, T = ${temperature.toFixed(0)}K, R = ${radius.toFixed(2)}&mu;m, n = ${index.toFixed(2)}, P = ${power.toFixed(3)}W`;
      }
      updateInfo();  // Display the initial info

      var inputStep = document.getElementById('slider-step');
      var inputTemperature = document.getElementById('slider-temperature');
      var inputRadius = document.getElementById('slider-radius');
      var inputIndex = document.getElementById('slider-index');
      var inputPower = document.getElementById('slider-power');

      inputStep.addEventListener('input', function(e) {
        dt = Math.pow(10, 4*(e.srcElement.value/100.0)-6);
        updateInfo();
      });
      inputTemperature.addEventListener('input', function(e) {
        temperature = Math.pow(10, 1 + 2.5*(e.srcElement.value/100.0));
        updateInfo();
      });
      inputRadius.addEventListener('input', function(e) {
        radius = Math.pow(10, -1 + (e.srcElement.value/100.0));
	objParticle.scale.x = radius;
	objParticle.scale.y = radius;
	objParticle.scale.z = radius;
        updateInfo();
      });
      inputIndex.addEventListener('input', function(e) {
        index = 1.33 + (e.srcElement.value/100.0)*(2.0-1.33);
        updateInfo();
      });
      inputPower.addEventListener('input', function(e) {
        power = 0.001 + 0.1*(e.srcElement.value/100.0);
        updateInfo();
      });

      var time = 0;
      var kb = 1.38064852e-23;  // [m^2 kg/s^2/K]
      var eta = 0.001;          // Water Viscosity Ns/m/m

      function randn_bm() {
	  var u = 0, v = 0;
	  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	  while(v === 0) v = Math.random();
	  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
      }

      // Not sure if I'm doing the right thing here
      var model;
      tf.loadLayersModel(
	  'https://ilent2.github.io/tweezers-ml/networks/nn5dof_size_ri/model.json').then(function(result) { model = result; });

      function force_method() {

	if (typeof model === 'undefined') {
	  return [0, 0, 0];
	}

	var prediction = model.predict(tf.tensor2d([
	  position[0]*1e6, position[1]*1e6, position[2]*1e6,
	  radius, index], [1, 5]));
	prediction = prediction.dataSync();

	for (var i = 0; i < 3; i++) {
	  prediction[i] *= Math.pow(radius, 2) *
	      (index-1.33) * power / 3.0e8;
	}

	//console.log(prediction);
	return prediction;
      }

      var scale = 200/wavelength;

  function updateSceneDraw() {
	  // Update the scene
	  objParticle.position.x = position[0]*scale;
	  objParticle.position.z = position[1]*scale;
	  objParticle.position.y = position[2]*scale;
	  render();

    // Calculate stiffness estimate
    //stiff = calculateStiffness();

    // Update infoPosition text
    infoPosition.innerHTML = `x = ${(position[0]*1e6).toFixed(2)}, ${(position[1]*1e6).toFixed(2)}, ${(position[2]*1e6).toFixed(2)} &mu;m <br>F = ${(force[0]*1e12).toFixed(2)}, ${(force[1]*1e12).toFixed(2)}, ${(force[2]*1e12).toFixed(2)} pN`;
    //infoPosition.innerHTML += `<br>k = ${(stiff[0]*1e6).toFixed(2)}, ${(stiff[1]*1e6).toFixed(2)}, ${(stiff[2]*1e6).toFixed(2)} pN/&mu;m`;
  }

      function updateScene() {

	if (bRunning) {

	  time = time + dt;

	  // Calculate the force at this location [N]
	  force = force_method();
  
	  // Calculate drag (function of radius)
	  Gt = 6*Math.PI*eta*(radius*1e-6);

	  for (var i = 0; i < 3; i++) {
	    // Calculate change in position (force contribution)
	    dx = force[i]*dt/Gt;

	    // Calculate change in position (Brownian motion contribution)
	    dx = dx + Math.sqrt(2*kb*temperature*dt/Gt)*randn_bm();

	    // Move the particle (store position)
	    position[i] = position[i] + dx;

      // Store values for stiffness calculation and increment index
      //lastPositions[currStiffPoint+i*numStiffPoints] = position[i];
      //lastForces[currStiffPoint+i*numStiffPoints] = force[i];
      //currStiffPoint = (currStiffPoint + 1) % numStiffPoints;
	  }

    // Update particle position and text
    updateSceneDraw();

	}
      }

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
        var geometry = new THREE.SphereGeometry( 1e-6*scale, 32, 32 );
        //var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        objParticle = new THREE.Mesh( geometry, shadowMaterial );
	objParticle.scale.x = radius;
	objParticle.scale.y = radius;
	objParticle.scale.z = radius;
        scene.add( objParticle );

        // Draw the beam
        var cylinder_height = 0.1e-6;
        var cylinder_segs = 40;
        objBeam = new THREE.Group();
        objBeamFWHM = new THREE.Group();
        for (var i = 0; i < cylinder_segs; i++) {

          var z0 = (i-cylinder_segs/2-0.5)*cylinder_height;
          var z1 = (i+1-cylinder_segs/2-0.5)*cylinder_height;

          var lambda = 800e-9;
          var wn = lambda / (Math.PI * Math.asin(1.02/1.3));
          var zR = Math.PI * wn * wn / lambda;
          var w0 = wn*Math.sqrt(1 + Math.pow(z0/zR, 2));
          var w1 = wn*Math.sqrt(1 + Math.pow(z1/zR, 2));

          var geometry = new THREE.CylinderGeometry( w1*scale, w0*scale,
              cylinder_height*scale, 32, 1, true);
          var material = new THREE.MeshBasicMaterial(
              {color: 0xffaaaa, transparent: true, opacity: 0.3,
               side: THREE.FrontSide } );
          var cylinder = new THREE.Mesh( geometry, material );
          cylinder.position.y = (z0+z1)/2*scale;
          objBeam.add(cylinder);

          /*var sc = Math.sqrt(2 * Math.log(2));
          var geometry = new THREE.CylinderGeometry( sc*w1*scale, sc*w0*scale,
              cylinder_height*scale, 32, 1, true);
          var cylinder = new THREE.Mesh( geometry, material );
          cylinder.position.y = (z0+z1)/2*scale;
          objBeamFWHM.add(cylinder);*/
        }
        //scene.add(objBeamFWHM);
        scene.add(objBeam);

        // TODO: We need to do the simulation

        // Draw lin
        /*var material = new THREE.LineBasicMaterial({
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
        scene.add( objTrace );*/

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( width, height );
				container.appendChild( renderer.domElement );

				//stats = new Stats();
				//container.appendChild( stats.dom );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				//
				window.addEventListener( 'resize', onWindowResize, false );

        // Add mouse click listener to change particle position
        renderer.domElement.addEventListener('mousedown', function(e) {
          onCanvasMouseDown(renderer.domElement, e);
        })

      // Start updating the scene
      setInterval(updateScene, 100);
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

      // Change particle position from click event
      function onCanvasMouseDown(canvas, event) {

        // Get particle position in canvas (SO: a/18053642)
        const rect = canvas.getBoundingClientRect()
        const x = 2*(event.clientX - rect.left - windowHalfX)/canvas.width;
        const y = 2*(-(event.clientY - rect.top) + windowHalfY)/canvas.height;

        // Apply camera perspective to point
        var plane = new THREE.Plane(new THREE.Vector3(0,0,1));
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        var intersects = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersects);

        // Convert to simulation coordinates and update particle position
        position[0] = intersects.x/scale;
        position[1] = 0;
        position[2] = intersects.y/scale;

        // Update the scene (even when stopped)
        updateSceneDraw();
      }
			//
			function animate() {
				requestAnimationFrame( animate );
				render();
				//stats.update();
			}
			function render() {
				// Disabled for now, was a bit confusing
				//camera.position.x += ( mouseX - camera.position.x ) * 0.2;
				//camera.position.y += ( - mouseY - camera.position.y ) * 0.2;
				camera.lookAt( scene.position );
				renderer.render( scene, camera );
			}

