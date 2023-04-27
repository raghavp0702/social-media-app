FROM node:16

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "test"]

# RUN echo '#!/bin/bash \n npm test \n npm start' > /run.sh && \
#     chmod +x /run.sh

# # Run the script
# CMD ["/run.sh"]

# CMD ["npm", "test"]

# CMD ["npm", "start"]
