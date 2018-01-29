### Narrasys HTTPS development server

#### Instructions

1. Install project dependencies 


    npm install

2. provide necessary SSL credentials in the <code>/certs</code> directory


    <client-dir>/utils/https-dev-sever/certs/private-2017.key
    <client-dir>/utils/https-dev-sever/certs/ssl-bundle-2017.crt
    
    
3. start server (since we're serving on ports 80 and 443, we need to run the server as root)


    sudo node index.js
    
   
4. Access local version of app at: https://localhost.narrasys.com     
        

