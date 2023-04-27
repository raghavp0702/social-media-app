# social-media-app
deployed at
https://social-media-api-5f39.onrender.com



to build docker file 
docker build -t social-media-app .  

to run docker file 
docker run --rm -d -p 5000:5000 -e MONGO_URL='mongodb+srv://root:root@cluster0.2hstmdz.mongodb.net/test' --name social-media-container social-media-app
