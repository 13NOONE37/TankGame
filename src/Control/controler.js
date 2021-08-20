const controler = (debugObject, xPosition, yPosition) => {
  //shoot
  window.addEventListener('click', () => {
    console.log('shoot');
  });
  //viewfinder
  window.addEventListener('mousemove', ({ offsetX, offsetY }) => {
    console.log(offsetX, offsetY);
  });

  //move tank
  window.addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
      case 69: {
        console.log('toggle engine');
        break;
      }
      case 87: {
        console.log('move forward');
        debugObject.isGoForward = true;
        break;
      }
      case 83: {
        console.log('move backward');
        debugObject.isGoBackward = true;
        break;
      }
      case 65: {
        console.log('move left');
        debugObject.isGoLeft = true;
        break;
      }
      case 68: {
        console.log('move right');
        debugObject.isGoRight = true;
        break;
      }
      case 32: {
        console.log('brake');
        break;
      }
      case 16: {
        console.log('boost');
        break;
      }
    }
  });
  window.addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
      case 69: {
        console.log('toggle engine');
        break;
      }
      case 87: {
        console.log('move forward');
        debugObject.isGoForward = false;

        break;
      }
      case 83: {
        console.log('move backward');
        debugObject.isGoBackward = false;
        break;
      }
      case 65: {
        console.log('move left');
        debugObject.isGoLeft = false;
        break;
      }
      case 68: {
        console.log('move right');
        debugObject.isGoRight = false;
        break;
      }
      case 32: {
        console.log('brake');
        break;
      }
      case 16: {
        console.log('boost');
        break;
      }
    }
  });
};
export default controler;
