/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */



var WEBGL = {

	isWebGLAvailable: function () {

		try {

			var canvas = document.createElement( 'canvas' );
			return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

		} catch ( e ) {

			return false;

		}

	},

	isWebGL2Available: function () {

		try {

			var canvas = document.createElement( 'canvas' );
			return !! ( window.WebGL2RenderingContext && canvas.getContext( 'webgl2' ) );

		} catch ( e ) {

			return false;

		}

	},

	getWebGLErrorMessage: function () {

		return this.getErrorMessage( 1 );

	},

	getWebGL2ErrorMessage: function () {

		return this.getErrorMessage( 2 );

	},

	getErrorMessage: function ( version ) {

		var names = {
			1: 'WebGL',
			2: 'WebGL 2'
		};

		var contexts = {
			1: window.WebGLRenderingContext,
			2: window.WebGL2RenderingContext
		};

		var message = 'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>';

		var element = document.createElement( 'div' );
		element.id = 'webglmessage';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
    element.style.background = '#ffa';
    element.style.color = '#000';
    element.style.padding = '1.5em';
    //element.style.width = '400px';
    element.style.margin = '10px 10px 10px 10px';

		if ( contexts[ version ] ) {

			message = message.replace( '$0', 'graphics card' );

		} else {

			message = message.replace( '$0', 'browser' );

		}

		message = message.replace( '$1', names[ version ] );

		element.innerHTML = message;

		return element;

	}

};

// From SO: a/53149880/2372604

function get_browser() {
  var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE', version: (tem[1] || '') };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/)
    if (tem != null) { return { name: 'Opera', version: tem[1] }; }
  }
  if (window.navigator.userAgent.indexOf("Edge") > -1) {
    tem = ua.match(/\Edge\/(\d+)/)
    if (tem != null) { return { name: 'Edge', version: tem[1] }; }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
  return {
    name: M[0],
    version: +M[1]
  };
}

var browser = get_browser()
var isSupported = isSupported(browser);

function isSupported(browser) {
  var supported = false;
  if (browser.name === "Chrome" && browser.version >= 9) {
    supported = true;
  } /*else if ((browser.name === "MSIE" || browser.name === "IE") && browser.version >= 11) {
    supported = true;
  } */else if (browser.name === "Edge") {
    supported = true;
  } else if (browser.name === "Opera" && browser.version >= 15) {
    supported = true;
  } else if (browser.name === "Safari" && browser.version >= 5) {
    supported = true;
  } else if (browser.name === "Firefox" && browser.version >= 4) {
    supported = true;
  } else {
    console.log(browser);
  }

  return supported;
}

if (!isSupported) {

  var element = document.createElement( 'div' );
    element.id = 'webglmessage';
    element.style.fontFamily = 'monospace';
    element.style.fontSize = '13px';
    element.style.fontWeight = 'normal';
    element.style.textAlign = 'center';
    element.style.background = '#ffa';
    element.style.color = '#000';
    element.style.padding = '1.5em';
    //element.style.width = '400px';
    element.style.margin = '10px 10px 10px 10px';

  var warning = "This browser does not appear to be supported.  Try updating your browser."
  element.innerHTML = warning;
  document.getElementById( 'error-container' ).appendChild(element);
}
else if ( WEBGL.isWebGLAvailable() === false ) {

  var warning = WEBGL.getWebGLErrorMessage();
  document.getElementById( 'error-container' ).appendChild( warning );

}

