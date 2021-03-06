# tweezers-ml
Interactive Optical Tweezers simulation using Machine Learning

## Accessing the simulation

The simulation is hosted via GitHub Pages and runs directly
in your browser using JavaScript.  To view the page, go to
[https://ilent2.github.io/tweezers-ml/](https://ilent2.github.io/tweezers-ml/).

## About

The above simulation shows the optical forces acting on a
spherical particle in a tightly focussed laser beam.
The forces are calculated using a pre-trained artificial
neural network, allowing for fast and accurate execution
in-browser (on your phone or personal computer).
The simulation using a finite difference method to simulate
particle dynamics, accuracy of this method depends on
simulation parameters, not all simulation parameters will
produce physically accurate results.
Training data was generated using the
[optical tweezers toolbox](https://github.com/ilent2/ott).
We used [Keras](https://keras.io/)
to train the neural network and
[TensorFlow.js](https://www.tensorflow.org/js) to evaluate
the neural network in browser.
For full details see [*Machine learning reveals complex behaviours in optically
trapped particles*, Machine Learning Science and Technology, 2020](https://doi.org/10.1088/2632-2153/abae76).

## Future plans

The initial version of this simulation is for a demonstration at a
conference.  There are a few other things we could add to make the
demonstration more useful:

 * Show the particle trace/trajectory
 * Additional pre-trained neural networks
 * More general neural networks
 * Ability to upload a custom neural network
 * Warnings/validity checks on dynamics simulations
 * Tutorial or instructions on training your own network

