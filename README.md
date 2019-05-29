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
Training data was generated using the
[optical tweezers toolbox](https://github.com/ilent2/ott).
We used [Keras](https://keras.io/)
to train the neural network and
[TensorFlow.js](https://www.tensorflow.org/js) to evaluate
the neural network in browser.
For full details see PAPER LINK COMING SOON.

## Future plans

The initial version of this simulation is for a demonstration at a
conference.  There are a few other things we could add to make the
demonstration more useful:

 * Additional pre-trained neural networks
 * More general neural networks
 * Ability to upload a custom neural network
 * Warnings/validity checks on dynamics simulations
 * Tutorial or instructions on training your own network

