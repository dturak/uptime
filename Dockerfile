FROM node:12

# Copy the current directory contents into the container at /app
COPY . /app

# Set the working directory to /automation-framework-mock-api
WORKDIR /app

# Install Uptime
RUN npm install

#RUN node test
RUN yarn test

# Make port 2121 available to the world outside this container
EXPOSE 3003

# Define environment variable
ENV NAME Uptime

# Run mock_api_endpoint when the container launches
CMD node app
