#Template Seeder

##first time setup
	npm install
	
##How to

In order to keep credentials out of VCS, we use a 
.env file to set environment variables. 

Create and format the .env file as follows:

	USERNAME=<your user name>
	VHOST=<your vhost url >
	API_DEV_PASSWORD=<dev password>
    LOCALHOST_PASSWORD=<local password>
    STORY_PASSWORD=<your prod password>
    
these values are used in utils.js    
##example use

	node index.js [flags]
	
with actual values
	
	node index.js --url 'templates/episode/career-playbook.html' --applies_to_episodes true --name 'Career Playbook' --seed_template false --env api-dev
	 
## available flags
	 --env (optional) <string> which environment to seed the template, options are localhost, api-dev, demo, story, defaults to localhost
	 --name (optional) <string> the display name of the template
	 --url (required) <string> the path to the html template in the client app
	 --applies_to_episodes (required) <boolean> whether or not the template is an episdoe template or item template
	 --seed_template (optional) <boolean> false will GET request to /templates, true will POST new template
	 --event_types (optional) <array> can be  one of Upload, Scene, Plugin, Annotation, Link

