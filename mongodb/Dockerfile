FROM mongo:latest

# Copy any custom MongoDB configurations (optional)
COPY ./mongod.conf /etc/mongod.conf

# Expose the MongoDB port
EXPOSE 27017

# Set the default command to start the MongoDB server
CMD ["mongod", "--config", "/etc/mongod.conf"]
