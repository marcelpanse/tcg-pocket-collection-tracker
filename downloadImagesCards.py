import os
import json
import requests

# Define the directories
assets_dir = './frontend/assets/cards'
images_dir = './frontend/public/images'

# Ensure the images directory exists
os.makedirs(images_dir, exist_ok=True)
print("we")

# Function to calculate or retrieve the oriented bounding box
def get_oriented_bounding_box(image_url):
    # Placeholder function: replace with actual logic to calculate or retrieve the bounding box
    return {"x": 0, "y": 0, "width": 100, "height": 100, "angle": 0}

# Iterate over each JSON file in the assets directory
for filename in os.listdir(assets_dir):
    if filename.endswith('.json'):
        file_path = os.path.join(assets_dir, filename)
        
        # Print the file being processed
        print(f"Processing file: {filename}")
        
        # Open and load the JSON file
        with open(file_path, 'r') as file:
            data = json.load(file)
        
        # Iterate over each element in the JSON array
        for item in data:
            image_url = item.get('image')
            if image_url:
                # Extract the image name from the URL
                image_name = os.path.basename(image_url)
                
                # Print the image being downloaded
                print(f"Downloading image: {image_name}")
                
                # Download the image
                response = requests.get(image_url)
                if response.status_code == 200:
                    # Save the image to the images directory
                    image_path = os.path.join(images_dir, image_name)
                    with open(image_path, 'wb') as img_file:
                        img_file.write(response.content)
                    
                    # Print success message
                    print(f"Successfully downloaded: {image_name}")
                    
                    # Add oriented bounding box data to the item
                    item['oriented_bounding_box'] = get_oriented_bounding_box(image_url)
                else:
                    print(f"Failed to download image: {image_url}")
        
        # Save the updated JSON data back to the file
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)