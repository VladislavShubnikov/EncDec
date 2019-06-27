# Encode & Decode messages in png images

Simple web application to hide text messages into image files and extract text later. 
Can be used as a secure communication technique, using public (and open) delivery channels
like popular mobile and desktop messanger apps.

Project has 2 modes: Encoder and Decoder.

## Encoder mode
You need to select any image file in PNG format from your local disk and drag-n-drop it into application. 
Then you need to enter password (shared only with message recipient) and message text.
After entering both textual fields, you can save modified image, where your encrypted message is
embedded. Modified image lokks like original and it is very hard to extract embedded text without
password knowledge and algorithm details knowledge. Having modified image file you can send it to your
recipient via any famous mobile or desktop messanger app. Important note: you need to attach modified image
as "document", only in this way file will be trasferred exactly bit-to-bit.

## Decoder mode
If you want to extract hidden text, enter password (shared by sender), then drag-n-drop received modified image
into app. If password correct and image has hidden embedded message, app will show hidden text.


# Development commands

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run lint`

Check project for syntax problems


