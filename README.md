# LDJ - mycrocoin Smoke Test

The theme of the jam is 'Running Out Of Space' so we are making
a Battle Royale game with resource/currency management aspects.

### Developers

We're glad you want to contribute!

The first thing you'll need to do is fork the repo.

Then clone it so you have a local copy.

### Developer Setup

The game is made up of two components, the client and the server.
The client can be found in the `app` directory and the server can 
be found in the `server` directory.

#### Requirements

First you will need to install [NodeJS](https://nodejs.org/)

#### Working With The Client

All the front end code will be housed here, this is things like
how the game looks, how the players, text, and board are displayed.

To get this set up, navigate to `ldj/app/` and execute `npm install`
if that is completed successfully you can execute `npm start` which
will start your client and should open a browser with the game running
in it.

It will connect to the development server by default. To connect to an
alternative server you can make a change in the `Socket.js` file. 


#### Working With The Server

All of the backend code will be housed here, this is where most
of the game logic will be.

To get this set up, first you'll have to install nodemon by executing
`npm install -g nodemon`. Then navigate to `ldj/server` and execute
`npm install`. After that has completed enter `npm start` from the
same directory. This will start up a server at `localhost:3001` but
our client is pointing to the development server. You will need to
make a change in the `Socket.js` file found under `ldj/app/src/`.

simply change the line 

```
const socket = openSocket(<default_url>);
```

to

```
const socket = openSocket('localhost:3001');
```

now if you run both the client and server you will be running the
game entirely locally. This is a good place to experiment.

### Contributing To The Game

This project is managed through Mycrocoin. All contributions must
follow the Mycrocoin workflow. This is good for you! It means you
will be rewarded for the contributions you make to the codebase!

#### How To Contribute

```
// TODO: Add Mycrocoin instructions when you do them
``` 