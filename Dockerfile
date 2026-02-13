# Use official Node image
FROM node:18

# Create app directory inside container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining project files
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
