# Use Node.js LTS image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

RUN npm init -y
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install


RUN npm i googleapis

# Copy the application code
COPY . .

# Set environment variables for Google credentials
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json

# Expose port (if the app serves content, otherwise remove)
EXPOSE 3005

# Define the command to run the app
#CMD ["node", "index.js"]
CMD ["sh", "-c", "tail -f /dev/null"]
