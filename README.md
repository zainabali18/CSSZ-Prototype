# CSSZ Prototype Group - SSH Recipe Recommendation App

## Available Scripts

To run the web app, go to the terminal and change to the "ssh-web-app" directory 
Code on terminal: "cd ssh-web-app"

To build the docker container run: `docker build --no-cache -t ssh-web-app . `

And then to run to run the webapp and server run : `docker run -p 3000:3000 -p 5001:5001 ssh-web-app`

This will run the React app on port 3000 and the server on port 5000

You can now view ssh-web-app in the browser by heading to : `http://localhost:3000`

Note: As long as you have Docker installed, you can run the container without installing Node.js.
However, to run the test scripts, you need to have node@18 installed
MacOS download: brew install node@18
Windows download: fnm use --install-if-missing 18

To verify the right Node.js version is in the environment run : `node -v` it should print `v18.20.5`

To run the test scripts, navigate to "ssh-web-app directory" and run `npm test`. 
This launches the test runner in the interactive watch mode.
